
use actix_http::body::{MessageBody};
use actix_http::header::{self, HeaderValue};
use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform};
use actix_web::{Result};
use futures::{future::Ready, task, Future};
use futures_util::future::ok;


use std::{pin::Pin};

use crate::misc::{error::Error, response::ErrorResponseData};


pub struct ErrorFormatter {}

pub fn error_formatter() -> ErrorFormatter {
    ErrorFormatter {}
}

impl<S> Transform<S, ServiceRequest> for ErrorFormatter
where
    S: Service<ServiceRequest, Response = ServiceResponse, Error = actix_web::Error>,
    S::Future: 'static,
{
    type Response = ServiceResponse;
    type Error = actix_web::Error;
    type InitError = ();
    type Transform = ErrorFormatterMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(ErrorFormatterMiddleware { service })
    }
}

pub struct ErrorFormatterMiddleware<S> {
    service: S,
}

impl<S> Service<ServiceRequest> for ErrorFormatterMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse, Error = actix_web::Error>,
    S::Future: 'static,
{
    type Response = ServiceResponse;
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&self, ctx: &mut task::Context<'_>) -> task::Poll<Result<(), Self::Error>> {
        self.service.poll_ready(ctx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let future = self.service.call(req);
        Box::pin(async move {
            let result = future.await?;
            let status = result.status();
            if status.is_client_error() || status.is_server_error() {

                // Ignore if already in json format.
                let content_type = result.headers().get(header::CONTENT_TYPE);
                if let Some("application/json") = content_type.and_then(|v|v.to_str().ok()) {
                    return Ok(result);
                }

                let mut is_json_body = false;
                let mut result = result.map_body(|_, body| match body.try_into_bytes() {
                    Ok(bytes) => {
                        let json = ErrorResponseData::from(
                                Error::Uncaught(
                                    std::str::from_utf8(&bytes).unwrap().to_owned()))
                            .build_json();

                        is_json_body = true;
                        MessageBody::boxed(json)
                    },
                    Err(body) => body
                });
                if is_json_body {
                    result.headers_mut().append(header::CONTENT_TYPE, HeaderValue::from_static("application/json"));
                }
                
                Ok(result)
            } else {
                Ok(result)
            }
        })
    }
}
