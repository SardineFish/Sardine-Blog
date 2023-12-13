use actix_http::{
    header::{self, HeaderName, HeaderValue},
    Method,
};
use actix_web::dev::{ServiceRequest, ServiceResponse};

use crate::misc::response::CORSAccessControl;

use super::func_middleware::*;

#[derive(Clone, Copy)]
pub enum AccessControl {
    AnyPostJson,
    AnyGet,
}

impl CORSAccessControl for AccessControl {
    fn allow_origin(&self) -> Option<&str> {
        Some("*")
    }
    fn allow_methods(&self) -> Option<Vec<Method>> {
        match self {
            AccessControl::AnyGet => Some(vec![Method::GET]),
            AccessControl::AnyPostJson => Some(vec![Method::POST]),
        }
    }
    fn allow_headers(&self) -> Option<Vec<HeaderName>> {
        match self {
            AccessControl::AnyPostJson => Some(vec![header::CONTENT_TYPE]),
            _ => None,
        }
    }
}

async fn access_control_middleware<S, B>(
    request: ServiceRequest,
    srv: &'static S,
    access: AccessControl,
) -> Result<ServiceResponse<B>, actix_web::Error>
where
    S: ServiceT<B>,
    S::Future: 'static,
    B: 'static,
{
    let response = srv.call(request).await;
    let response = match response {
        Ok(mut response) => {
            if let Some(origin) = access.allow_origin() {
                response.headers_mut().insert(
                    header::ACCESS_CONTROL_ALLOW_ORIGIN,
                    HeaderValue::from_str(origin)
                        .unwrap_or_else(|_| HeaderValue::from_static("null")),
                );
            }
            if let Some(methods) = access.allow_methods() {
                for m in methods {
                    response.headers_mut().insert(
                        header::ACCESS_CONTROL_ALLOW_METHODS,
                        HeaderValue::from_str(m.as_str())
                            .unwrap_or_else(|_| HeaderValue::from_static("null")),
                    );
                }
            }
            if let Some(headers) = access.allow_headers() {
                for h in headers {
                    response.headers_mut().insert(
                        header::ACCESS_CONTROL_ALLOW_HEADERS,
                        HeaderValue::from_name(h),
                    );
                }
            }
            Ok(response)
        }
        x => x,
    };
    response
}

// async_middleware!(pub authentication, auth_middleware);
async_middleware!(pub fn access_control(access: AccessControl), access_control_middleware(access));
