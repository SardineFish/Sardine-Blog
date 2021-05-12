
use std::ops::Try;

use actix_http::{ResponseBuilder, cookie::Cookie, http::StatusCode};
use futures::{Future, future::{Ready, ready}};
use serde::{Serialize};
use actix_web::{ HttpRequest, HttpResponse, Responder, dev::{ServiceRequest, ServiceResponse}};

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
pub struct ErrorResponseData {
    status: &'static str,
    timestamp: i64,
    code: u64,
    msg: String,
}

impl ErrorResponseData {
    pub fn into_json(&self) -> String {
        serde_json::ser::to_string(&self).unwrap()
    }
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

pub trait BuildResponse {
    fn status_code(&self) -> StatusCode {
        StatusCode::OK
    }
    fn build_response(self, builder: ResponseBuilder) -> Result<HttpResponse, Error>;
}

impl<T> BuildResponse for T where T : Serialize {
    fn build_response(self, mut builder: ResponseBuilder) -> Result<HttpResponse, Error> {
        let response = SuccessResponseData::with_data(self);
        let body = serde_json::to_string(&response)
            .map_err(|_| Error::SerializeError)?;
        Ok(builder.content_type("application/json").body(body))
    }
}

pub struct WithCookie<'c, T : Serialize>(pub T, pub Vec<Cookie<'c>>);

impl<'c, T : Serialize> BuildResponse for WithCookie<'c, T> {
    fn build_response(self, mut builder: ResponseBuilder) -> Result<HttpResponse, Error> {
        let Self(data, cookies) = self;
        for cookie in cookies {
            builder.cookie(cookie.clone());
        }
        data.build_response(builder)
    }
}

#[allow(dead_code)]
pub enum Redirect
{
    MovedPermanently(String),
    PermanentRedirect(String),
    SeeOther(String),
    TemporaryRedirect(String),
}

impl BuildResponse for Redirect {
    fn status_code(&self) -> StatusCode {
        match self {
            Self::MovedPermanently(_) => StatusCode::MOVED_PERMANENTLY,
            Self::PermanentRedirect(_) => StatusCode::PERMANENT_REDIRECT,
            Self::SeeOther(_) => StatusCode::SEE_OTHER,
            Self::TemporaryRedirect(_) => StatusCode::TEMPORARY_REDIRECT,
        }
    }
    fn build_response(self, mut builder: ResponseBuilder) -> Result<HttpResponse, Error> {
        match self {
            Self::MovedPermanently(url) |
            Self::PermanentRedirect(url) |
            Self::SeeOther(url) |
            Self::TemporaryRedirect(url) 
                => {
                    let data = SuccessResponseData::with_data(&url);
                    let body = serde_json::to_string(&data)
                        .map_err(|_| Error::SerializeError)?;
                    Ok(builder
                        .set_header("Location", url)
                        .content_type("application/json")
                        .body(body))
                },
        }
    }
}

pub enum Response<T : BuildResponse = ()> {
    Ok(T),
    ClientError(Error),
    ServerError(Error),
}

impl<T> Try for Response<T> where T: BuildResponse {
    type Ok = T;
    type Error = Error;
    fn from_ok(v: T) -> Self {
        Self::Ok(v)
    }
    fn from_error(err: Error) -> Self {
        match err.status_code() {
            StatusCode::INTERNAL_SERVER_ERROR => Response::ServerError(err),
            _ => Response::ClientError(err)
        }
    }
    fn into_result(self) -> Result<T, Error> {
        match self {
            Response::Ok(v) => Ok(v),
            Response::ClientError(err) => Err(err),
            Response::ServerError(err) => Err(err),
        }
    }
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

impl<T : BuildResponse> From<Result<T, Error>> for Response<T> {
    fn from(result: Result<T, Error>) -> Self {
        match result {
            Ok(data) => Response::Ok(data),
            Err(err) => match err.status_code() {
                StatusCode::INTERNAL_SERVER_ERROR => Response::ServerError(err),
                _ => Response::ClientError(err)
            },
        }
    }
}

pub async fn run<R : BuildResponse, F: Future<Output = Result<R, Error>>>(func: F) -> Response<R> {
    let result = func.await;
    Response::<R>::from(result)
}

#[actix_web::get("/")]
async fn get_foo() -> Response<Option<u32>> {
    run(async move {
        let _t = Err(Error::WebError(actix_web::error::ErrorInternalServerError("")))?;
        Ok(Some(1 as u32))
    }).await
}

impl<T: BuildResponse> Responder for Response<T> {
    type Error = actix_web::Error;
    type Future = Ready<Result<HttpResponse, Self::Error>>;
    fn respond_to(self, _req: &HttpRequest) -> Self::Future {

        let error_response = match self {
            Response::Ok(data) => {
                let status_code = data.status_code();
                let result = data.build_response(HttpResponse::build(status_code));
                match result {
                    Ok(http_response) => return ready(Ok(http_response)),
                    Err(err) => Response::ServerError(err)
                }
            }
            others => others
        };

        let (status_code, body) = match error_response {
            Response::ClientError(err) => (err.status_code(), 
                serde_json::to_string(&ErrorResponseData::from(err)).map_err(|_|Error::SerializeError)),
            Response::ServerError(err) => (err.status_code(), Err(err)),
            _ => unreachable!(),
        };
        
        match body {
            Ok(body) => ready(Ok(HttpResponse::build(status_code)
                .content_type("application/json")
                .body(body))),
            Err(err) => ready(Err(actix_web::error::ErrorInternalServerError(err)))
        }
    }
}
