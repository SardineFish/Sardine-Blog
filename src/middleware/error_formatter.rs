use actix_http::{body::{Body, ResponseBody}, http::{HeaderValue, header}};
use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform};
use actix_web::{web::Bytes, Result};
use futures::{future::Ready, task, Future};
use futures_util::future::ok;
use log::{warn};

use std::{pin::Pin};

use crate::misc::{error::Error, response::ErrorResponseData};


pub struct ErrorFormatter {}

pub fn error_formatter() -> ErrorFormatter {
    ErrorFormatter {}
}

impl<S> Transform<S> for ErrorFormatter
where
    S: Service<Request = ServiceRequest, Response = ServiceResponse, Error = actix_web::Error>,
    S::Future: 'static,
{
    type Request = ServiceRequest;
    type Response = ServiceResponse;
    type Error = actix_web::Error;
    type InitError = ();
    type Transform = ErrorFormatterMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(ErrorFormatterMiddleware { service: service })
    }
}

pub struct ErrorFormatterMiddleware<S> {
    service: S,
}

impl<S> Service for ErrorFormatterMiddleware<S>
where
    S: Service<Request = ServiceRequest, Response = ServiceResponse, Error = actix_web::Error>,
    S::Future: 'static,
{
    type Request = ServiceRequest;
    type Response = ServiceResponse;
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&mut self, ctx: &mut task::Context<'_>) -> task::Poll<Result<(), Self::Error>> {
        self.service.poll_ready(ctx)
    }

    fn call(&mut self, req: Self::Request) -> Self::Future {
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

                let mut result = result.map_body(|_, body| match body {
                    ResponseBody::Body(Body::Bytes(bytes)) => {
                        let json = ErrorResponseData::from(
                                Error::UncaughtError(
                                    std::str::from_utf8(&bytes).unwrap().to_owned()))
                            .build_json();
                        ResponseBody::Body(Body::Bytes(Bytes::from(json)))
                    },
                    ResponseBody::Other(Body::Bytes(bytes)) => {
                        let json = ErrorResponseData::from(
                                Error::UncaughtError(
                                    std::str::from_utf8(&bytes).unwrap().to_owned()))
                            .build_json();
                        ResponseBody::Other(Body::Bytes(Bytes::from(json)))
                    }
                    _ => {
                        warn!("Unkown error response body");
                        let json = ErrorResponseData::from(
                                Error::UncaughtError(status.to_string().to_owned()))
                            .build_json();
                        ResponseBody::Body(Body::Bytes(Bytes::from(json)))
                    }
                });
                result.headers_mut().append(header::CONTENT_TYPE, HeaderValue::from_static("application/json"));
                Ok(result)
            } else {
                Ok(result)
            }
        })
    }
}
