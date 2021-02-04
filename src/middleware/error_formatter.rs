use actix_http::{
    body::{Body, ResponseBody},
};
use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform};
use actix_web::{web::Bytes, Result};
use futures::{future::Ready, task, Future};
use futures_util::future::ok;
use log::{warn};

use std::pin::Pin;

use serde::{Serialize};

#[derive(Serialize, Debug)]
struct ErrorMessage {
    error: String,
}

impl ErrorMessage {
    pub fn from_string<T: Into<String>>(str: T) -> Self {
        ErrorMessage {
            error: str.into()
        }
    }
    pub fn from_bytes(bytes: Bytes)-> Self {
        let msg = std::str::from_utf8(&bytes).unwrap();
        ErrorMessage {
            error: msg.to_string(),
        }
    }
    pub fn into_json(&self) -> String {
        serde_json::ser::to_string(self).unwrap()
    }
}

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
        ok(ErrorFormatterMiddleware { service: service })
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

    fn poll_ready(&mut self, ctx: &mut task::Context<'_>) -> task::Poll<Result<(), Self::Error>> {
        self.service.poll_ready(ctx)
    }

    fn call(&mut self, req: ServiceRequest) -> Self::Future {
        let future = self.service.call(req);
        Box::pin(async move {
            let result = future.await?;
            if result.status().is_client_error() || result.status().is_server_error() {
                let result = result.map_body(|_, body| match body {
                    ResponseBody::Body(Body::Bytes(bytes)) => {
                        let json = ErrorMessage::from_bytes(bytes).into_json();
                        ResponseBody::Body(Body::Bytes(Bytes::from(json)))
                    },
                    ResponseBody::Other(Body::Bytes(bytes)) => {
                        let json = ErrorMessage::from_bytes(bytes).into_json();
                        ResponseBody::Other(Body::Bytes(Bytes::from(json)))
                    }
                    _ => {
                        warn!("Unkown error response body");
                        let json = ErrorMessage::from_string("").into_json();
                        ResponseBody::Body(Body::Bytes(Bytes::from(json)))
                    }
                });
                Ok(result)
            } else {
                Ok(result)
            }
        })
    }
}
