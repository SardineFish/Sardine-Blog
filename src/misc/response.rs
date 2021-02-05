use std::fmt;

use actix_http::http::StatusCode;
use futures::{Future, future::{Ready, ready}};
use serde::{Serialize};
use actix_web::{FromRequest, HttpRequest, HttpResponse, Responder, dev::{ServiceRequest, ServiceResponse}};
use sar_blog::Error as ServiceError;

use super::error::Error;


#[derive(Serialize)]
struct SuccessResponseData<T: Serialize> {
    status: &'static str,
    timestamp: i64,
    data: T,
}

impl<T: Serialize> SuccessResponseData<T> {
    fn with_data(data: T) -> Self {
        Self {
            status: "^_^",
            timestamp: chrono::Utc::now().timestamp_millis(),
            data,
        }
    }
}
#[derive(Serialize)]
struct ErrorResponseData {
    status: &'static str,
    timestamp: i64,
    code: u64,
    msg: String,
}

impl From<Error> for ErrorResponseData {
    fn from(err: Error) -> Self {
        Self {
            status: ">_<",
            timestamp: chrono::Utc::now().timestamp_millis(),
            code: err.code(),
            msg: format!("{}", err),
        }
    }
}

pub enum Response<T : Serialize = ()> {
    Ok(T),
    ClientError(Error),
    ServerError(Error),
}

impl<T: Serialize> Response<T> {
    pub async fn to_service_response(self, request: ServiceRequest) -> actix_web::Result<ServiceResponse> {
        let (http_request, payload) = request.into_parts();
        let response = self.respond_to(&http_request).await?;
        match ServiceRequest::from_parts(http_request, payload) {
            Ok(request) => Ok(request.into_response(response)),
            _ => Err(actix_web::error::ErrorInternalServerError("Failed to construct service request"))
        }
    }
}

impl<T : Serialize> From<Result<T, Error>> for Response<T> {
    fn from(result: Result<T, Error>) -> Self {
        match result {
            Ok(data) => Response::Ok(data),
            Err(err) => Response::ServerError(err)
        }
    }
}

pub async fn run<R : Serialize, F: Future<Output = Result<R, Error>>>(func: F) -> Response<R> {
    let result = func.await;
    Response::<R>::from(result)
}

#[actix_web::get("/")]
async fn get_foo() -> Response<Option<u32>> {
    run(async move {
        let t = Err(Error::WebError(actix_web::error::ErrorInternalServerError("")))?;
        Ok(Some(1 as u32))
    }).await
}

impl<T: Serialize> Responder for Response<T> {
    type Error = actix_web::Error;
    type Future = Ready<Result<HttpResponse, Self::Error>>;
    fn respond_to(self, req: &HttpRequest) -> Self::Future {

        let (status_code, body) = match self {
            Response::Ok(data) => (StatusCode::OK,
                serde_json::to_string(&SuccessResponseData::with_data(data)).map_err(|_|Error::SerializeError)),
            Response::ClientError(err) => (err.status_code(), 
                serde_json::to_string(&ErrorResponseData::from(err)).map_err(|_|Error::SerializeError)),
            Response::ServerError(err) => (err.status_code(), Err(err)),
        };
        
        match body {
            Ok(body) => ready(Ok(HttpResponse::build(status_code)
                .content_type("application/json")
                .body(body))),
            Err(err) => ready(Err(actix_web::error::ErrorInternalServerError(err)))
        }
    }
}
