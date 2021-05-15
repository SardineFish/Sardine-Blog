
use std::{collections::HashMap, ops::Try, str};

use actix_http::{ResponseBuilder, cookie::Cookie, http::{HeaderName, Method, StatusCode, header}};
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

pub struct WithHeaders<T: BuildResponse>(pub T, pub HashMap<HeaderName, &'static str>);

impl<T: BuildResponse> BuildResponse for WithHeaders<T> {
    fn build_response(self, mut builder: ResponseBuilder) -> Result<HttpResponse, Error> {
        let Self(data, headers) = self;
        for (k, v) in headers {
            builder.set_header(k, v);
        }
        data.build_response(builder)
    }
}

pub struct NoContent;
impl BuildResponse for NoContent {
    fn build_response(self, mut builder: ResponseBuilder) -> Result<HttpResponse, Error> {
        Ok(builder.status(StatusCode::NO_CONTENT).finish())
    }
}

pub struct CORSPolicy {
    pub origin: Option<String>,
    pub methods: Option<Vec<Method>>,
    pub headers: Option<Vec<HeaderName>>,
}

pub trait CORSAccessControl {
    fn allow_origin_default() -> Option<&'static str>{
        None
    }
    fn allow_methods_default() -> Option<Vec<Method>> {
        None
    }
    fn allow_headers_default() -> Option<Vec<HeaderName>> {
        None
    } 
    fn allow_origin(&self) -> Option<&str>{
        <Self as CORSAccessControl>::allow_origin_default()
    }
    fn allow_methods(&self) -> Option<Vec<Method>> {
        <Self as CORSAccessControl>::allow_methods_default()
    }
    fn allow_headers(&self) -> Option<Vec<HeaderName>> {
        <Self as CORSAccessControl>::allow_headers_default()
    }
}

impl CORSAccessControl for CORSPolicy {
    fn allow_origin(&self) -> Option<&str> {
        self.origin.as_ref().map(|s|s.as_str())
    }
    fn allow_methods(&self) -> Option<Vec<Method>> {
        self.methods.clone()
    }
    fn allow_headers(&self) -> Option<Vec<HeaderName>> {
        self.headers.clone()
    }
}

pub struct WithCORS<U: CORSAccessControl, T>(pub U, pub T);

impl<U: CORSAccessControl, T: BuildResponse> BuildResponse for WithCORS<U, T> {
    fn build_response(self, mut builder: ResponseBuilder) -> Result<HttpResponse, Error> {
        let WithCORS(access_control, content) = self;
        if let Some(origin) = access_control.allow_origin() {
            builder.set_header(header::ACCESS_CONTROL_ALLOW_ORIGIN, origin);
        }
        if let Some(methods) = access_control.allow_methods() {
            builder.set_header(header::ACCESS_CONTROL_ALLOW_METHODS, 
                methods.iter().map(|m|m.as_str()).collect::<Vec<&str>>().join(","));
        }
        if let Some(headers) = access_control.allow_headers() {
            builder.set_header(header::ACCESS_CONTROL_ALLOW_HEADERS, headers.join(","));
        }
        content.build_response(builder)
    }
}

impl<U: CORSAccessControl + Default, E: Into<Error>> From<E> for WithCORS<U, Error> {
    fn from(err: E) -> Self {
        Self(U::default(), err.into())
    }
}

impl<U: CORSAccessControl, E: BuildError> BuildError for WithCORS<U, E> {
    fn status_code(&self) -> StatusCode {
        self.1.status_code()
    }
    fn error_response(self) -> ErrorResponseData {
        self.1.error_response()
    }
    fn build_response(self, mut builder: ResponseBuilder) -> HttpResponse {
        let WithCORS(access_control, err) = self;
        if let Some(origin) = access_control.allow_origin() {
            builder.set_header(header::ACCESS_CONTROL_ALLOW_ORIGIN, origin);
        }
        if let Some(methods) = access_control.allow_methods() {
            builder.set_header(header::ACCESS_CONTROL_ALLOW_METHODS, 
                methods.iter().map(|m|m.as_str()).collect::<Vec<&str>>().join(","));
        }
        if let Some(headers) = access_control.allow_headers() {
            builder.set_header(header::ACCESS_CONTROL_ALLOW_HEADERS, headers.join(","));
        }
        err.build_response(builder)
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

pub trait BuildError {
    fn status_code(&self) -> StatusCode;
    fn error_response(self) -> ErrorResponseData;
    fn build_response(self, builder: ResponseBuilder) -> HttpResponse;
}

impl BuildError for Error {
    fn status_code(&self) -> StatusCode {
        Error::status_code(self)
    }
    fn error_response(self) -> ErrorResponseData {
        self.into()
    }
    fn build_response(self, mut builder: ResponseBuilder) -> HttpResponse {
        let status = self.status_code();
        let data = self.error_response();
        builder.status(status).json(&data)
    }
}

pub enum Response<T : BuildResponse = (), E: BuildError = Error> {
    Ok(T),
    ClientError(E),
    ServerError(E),
}

impl<T, E> Try for Response<T, E> where T: BuildResponse, E: BuildError {
    type Ok = T;
    type Error = E;
    fn from_ok(v: T) -> Self {
        Self::Ok(v)
    }
    fn from_error(err: Self::Error) -> Self {
        match err.status_code() {
            StatusCode::INTERNAL_SERVER_ERROR => Response::ServerError(err),
            _ => Response::ClientError(err)
        }
    }
    fn into_result(self) -> Result<T, Self::Error> {
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

impl<T: BuildResponse, E: BuildError> Responder for Response<T, E> {
    type Error = actix_web::Error;
    type Future = Ready<Result<HttpResponse, Self::Error>>;
    fn respond_to(self, req: &HttpRequest) -> Self::Future {

        let error_response: Response<T, _> = match self {
            Response::Ok(data) => {
                let status_code = data.status_code();
                let result = data.build_response(HttpResponse::build(status_code));
                match result {
                    Ok(http_response) => return ready(Ok(http_response)),
                    Err(err) => Response::ServerError(err)
                }
            },
            Response::ClientError(err) => {
                let status_code = err.status_code();
                let result = err.build_response(HttpResponse::build(status_code));
                return ready(Ok(result));
            },
            Response::ServerError(err) => {
                let result = err.build_response(HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR));
                return ready(Ok(result));
            }
        };

        error_response.respond_to(req)
    }
}
