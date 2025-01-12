use std::{collections::HashMap, ops::Deref, str::FromStr};

use actix_http::{
    body::BoxBody,
    header::{HeaderName, HeaderValue},
    HttpMessage,
};
use actix_web::{
    body::MessageBody,
    dev::{ServiceRequest, ServiceResponse},
    web::{self},
};
use serde::{Deserialize, Serialize};
use shared::LogError;

use super::func_middleware::*;

#[derive(Clone, Copy, Debug)]
pub enum CacheExpire {
    Never,
    Seconds(usize),
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct SavedResponse {
    body: String,
    headers: HashMap<String, String>,
}

impl SavedResponse {
    pub fn into_response(self, request: ServiceRequest) -> ServiceResponse<BoxBody> {
        let mut response = request.into_response(self.body).map_into_boxed_body();
        for (k, v) in self.headers {
            if let Ok(header_name) = HeaderName::from_str(&k) {
                response.headers_mut().append(
                    header_name,
                    HeaderValue::from_str(&v)
                        .log_error("request_cache")
                        .unwrap_or(HeaderValue::from_static(" ")),
                );
            }
        }

        response
    }

    pub fn from_response(response: ServiceResponse<BoxBody>) -> (Self, ServiceResponse<BoxBody>) {
        let mut saved = Self::default();
        for (k, v) in response.headers() {
            saved.headers.insert(
                k.to_string(),
                v.to_str()
                    .log_error("request_cache")
                    .unwrap_or("")
                    .to_string(),
            );
        }

        let (req, res) = response.into_parts();
        let (res, body) = res.into_parts();

        match body.try_into_bytes() {
            Ok(bytes) => {
                let result = std::str::from_utf8(bytes.deref())
                    .map(|str| str.to_owned())
                    .log_error("request_cache")
                    .ok();

                if let Some(body) = result {
                    saved.body = body;
                }

                let res = res.set_body(bytes).map_into_boxed_body();
                let response = ServiceResponse::new(req, res);
                (saved, response)
            }
            Err(body) => {
                let res = res.set_body(body);
                let response = ServiceResponse::new(req, res);
                (saved, response)
            }
        }
    }
}

async fn cache_middleware<S>(
    request: ServiceRequest,
    srv: &'static S,
    namespace: &'static str,
    key: &'static str,
    expire: CacheExpire,
) -> Result<ServiceResponse<BoxBody>, actix_web::Error>
where
    S: ServiceT<BoxBody>,
    S::Future: 'static,
{
    let service = request
        .app_data::<web::Data<sar_blog::Service>>()
        .unwrap()
        .as_ref()
        .clone();

    let mut cache = service.cache().json::<SavedResponse>(namespace, key).await;

    if let Some(saved_response) = cache.get().await {
        log::info!("cache hit {namespace}: {key}");
        Ok(saved_response.into_response(request))
    } else {
        log::info!("cache miss {namespace}: {key}");
        let response = srv.call(request).await;
        if let Ok(response) = response {
            let (saved, response) = SavedResponse::from_response(response);

            match expire {
                CacheExpire::Never => cache.set(&saved).await,

                CacheExpire::Seconds(seconds) => cache.set_expire(saved, seconds).await,
            }

            Ok(response)
        } else {
            response
        }
    }
}

// async_middleware!(pub authentication, auth_middleware);
async_middleware!(pub fn cache_request(namespace: &'static str, key: &'static str, expire: CacheExpire,), cache_middleware(namespace, key, expire,));
