use std::{
    collections::HashMap,
    ops::{ControlFlow, FromResidual, Try},
    str,
};

use actix_http::{body::BoxBody, header::HeaderName};
use actix_web::{
    cookie::Cookie,
    dev::{ServiceRequest, ServiceResponse},
    http::{header, Method, StatusCode},
    HttpRequest, HttpResponse, HttpResponseBuilder, Responder,
};
use futures::Future;
use serde::Serialize;

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
    pub fn build_json(&self) -> String {
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
    fn build_response(self, builder: HttpResponseBuilder) -> Result<HttpResponse, Error>;
}

impl<T> BuildResponse for T
where
    T: Serialize,
{
    fn build_response(self, mut builder: HttpResponseBuilder) -> Result<HttpResponse, Error> {
        let response = SuccessResponseData::with_data(self);
        let body = serde_json::to_string(&response).map_err(|_| Error::Serialize)?;
        Ok(builder
            .content_type("application/json")
            .body(body)
            .map_into_boxed_body())
    }
}

pub struct WithCookie<'c, T: Serialize>(pub T, pub Vec<Cookie<'c>>);

impl<'c, T: Serialize> BuildResponse for WithCookie<'c, T> {
    fn build_response(self, mut builder: HttpResponseBuilder) -> Result<HttpResponse, Error> {
        let Self(data, cookies) = self;
        for cookie in cookies {
            builder.cookie(cookie.clone());
        }
        data.build_response(builder)
    }
}

pub struct WithHeaders<T: BuildResponse>(pub T, pub HashMap<HeaderName, &'static str>);

impl<T: BuildResponse> BuildResponse for WithHeaders<T> {
    fn build_response(self, mut builder: HttpResponseBuilder) -> Result<HttpResponse, Error> {
        let Self(data, headers) = self;
        for (k, v) in headers {
            builder.insert_header((k, v));
        }
        data.build_response(builder)
    }
}

pub struct NoContent;
impl BuildResponse for NoContent {
    fn build_response(self, mut builder: HttpResponseBuilder) -> Result<HttpResponse, Error> {
        builder.status(StatusCode::NO_CONTENT);
        Ok(builder.finish())
    }
}

pub struct CORSPolicy {
    pub origin: Option<String>,
    pub methods: Option<Vec<Method>>,
    pub headers: Option<Vec<HeaderName>>,
}

pub trait CORSAccessControl {
    fn allow_origin_default() -> Option<&'static str> {
        None
    }
    fn allow_methods_default() -> Option<Vec<Method>> {
        None
    }
    fn allow_headers_default() -> Option<Vec<HeaderName>> {
        None
    }
    fn allow_origin(&self) -> Option<&str> {
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
        self.origin.as_deref()
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
    fn build_response(self, mut builder: HttpResponseBuilder) -> Result<HttpResponse, Error> {
        let WithCORS(access_control, content) = self;
        if let Some(origin) = access_control.allow_origin() {
            builder.insert_header((header::ACCESS_CONTROL_ALLOW_ORIGIN, origin));
        }
        if let Some(methods) = access_control.allow_methods() {
            builder.insert_header((
                header::ACCESS_CONTROL_ALLOW_METHODS,
                methods
                    .iter()
                    .map(|m| m.as_str())
                    .collect::<Vec<&str>>()
                    .join(","),
            ));
        }
        if let Some(headers) = access_control.allow_headers() {
            builder.insert_header((header::ACCESS_CONTROL_ALLOW_HEADERS, headers.join(",")));
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
    fn build_response(self, mut builder: HttpResponseBuilder) -> HttpResponse {
        let WithCORS(access_control, err) = self;
        if let Some(origin) = access_control.allow_origin() {
            builder.insert_header((header::ACCESS_CONTROL_ALLOW_ORIGIN, origin));
        }
        if let Some(methods) = access_control.allow_methods() {
            builder.insert_header((
                header::ACCESS_CONTROL_ALLOW_METHODS,
                methods
                    .iter()
                    .map(|m| m.as_str())
                    .collect::<Vec<&str>>()
                    .join(","),
            ));
        }
        if let Some(headers) = access_control.allow_headers() {
            builder.insert_header((header::ACCESS_CONTROL_ALLOW_HEADERS, headers.join(",")));
        }
        err.build_response(builder)
    }
}

#[allow(dead_code)]
pub enum Redirect {
    MovedPermanently(String),
    Permanent(String),
    SeeOther(String),
    Temporary(String),
}

impl BuildResponse for Redirect {
    fn status_code(&self) -> StatusCode {
        match self {
            Self::MovedPermanently(_) => StatusCode::MOVED_PERMANENTLY,
            Self::Permanent(_) => StatusCode::PERMANENT_REDIRECT,
            Self::SeeOther(_) => StatusCode::SEE_OTHER,
            Self::Temporary(_) => StatusCode::TEMPORARY_REDIRECT,
        }
    }
    fn build_response(self, mut builder: HttpResponseBuilder) -> Result<HttpResponse, Error> {
        match self {
            Self::MovedPermanently(url)
            | Self::Permanent(url)
            | Self::SeeOther(url)
            | Self::Temporary(url) => {
                let data = SuccessResponseData::with_data(&url);
                let body = serde_json::to_string(&data).map_err(|_| Error::Serialize)?;
                Ok(builder
                    .insert_header(("Location", url))
                    .content_type("application/json")
                    .body(body))
            }
        }
    }
}

pub trait BuildError {
    fn status_code(&self) -> StatusCode;
    fn error_response(self) -> ErrorResponseData;
    fn build_response(self, builder: HttpResponseBuilder) -> HttpResponse;
}

impl BuildError for Error {
    fn status_code(&self) -> StatusCode {
        Error::status_code(self)
    }
    fn error_response(self) -> ErrorResponseData {
        self.into()
    }
    fn build_response(self, mut builder: HttpResponseBuilder) -> HttpResponse {
        let status = self.status_code();
        if status.is_server_error() {
            log::error!("{:?}", self);
        }
        let data = self.error_response();
        builder.status(status).json(&data).map_into_boxed_body()
    }
}

// impl<T> BuildError for T where T : Into<Error> {
//     fn status_code(&self) -> StatusCode {
//         Error::status_code(self.in)
//     }
//     fn error_response(self) -> ErrorResponseData {
//         self.into()
//     }
//     fn build_response(self, mut builder: ResponseBuilder) -> HttpResponse {
//         let status = self.status_code();
//         if status.is_server_error() {
//             log::error!("{:?}", self);
//         }
//         let data = self.error_response();
//         builder.status(status).json(&data)
//     }
// }

pub enum Response<T, E = Error> {
    Ok(T),
    ClientError(E),
    ServerError(E),
}

impl<T: BuildResponse, E: BuildError> Responder for Response<T, E> {
    type Body = BoxBody;
    fn respond_to(self, req: &HttpRequest) -> HttpResponse<Self::Body> {
        let error_response: Response<T, _> = match self {
            Response::Ok(data) => {
                let status_code = data.status_code();
                let result = data.build_response(HttpResponse::build(status_code));
                match result {
                    Ok(http_response) => return http_response,
                    Err(err) => Response::ServerError(err),
                }
            }
            Response::ClientError(err) => {
                let status_code = err.status_code();
                let result = err.build_response(HttpResponse::build(status_code));
                return result;
            }
            Response::ServerError(err) => {
                let result =
                    err.build_response(HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR));
                return result;
            }
        };

        error_response.respond_to(req)
    }
}

impl<T> Try for Response<T, Error>
where
    T: BuildResponse,
{
    type Output = T;

    type Residual = Response<!, Error>;

    fn from_output(output: Self::Output) -> Self {
        Self::Ok(output)
    }

    fn branch(self) -> std::ops::ControlFlow<Self::Residual, Self::Output> {
        match self {
            Self::Ok(output) => ControlFlow::Continue(output),
            Self::ClientError(err) => ControlFlow::Break(Response::ClientError(err)),
            Self::ServerError(err) => ControlFlow::Break(Response::ServerError(err)),
        }
    }
}

impl<T: BuildResponse, E: Into<Error>> FromResidual<Response<!, E>> for Response<T, Error> {
    fn from_residual(residual: Response<!, E>) -> Self {
        match residual {
            Response::ClientError(err) => Self::ClientError(err.into()),
            Response::ServerError(err) => Self::ServerError(err.into()),
            Response::Ok(_) => unreachable!(),
        }
    }
}

impl<T: BuildResponse, E: Into<Error>> FromResidual<Result<std::convert::Infallible, E>>
    for Response<T, Error>
{
    fn from_residual(residual: Result<std::convert::Infallible, E>) -> Self {
        match residual {
            Ok(_) => unreachable!(),
            Err(err) => {
                let err = err.into();
                match err.status_code() {
                    StatusCode::INTERNAL_SERVER_ERROR => Response::ServerError(err),
                    _ => Response::ClientError(err),
                }
            }
        }
    }
}

impl<T: BuildResponse, E: BuildError> From<Result<T, E>> for Response<T, E> {
    fn from(result: Result<T, E>) -> Self {
        match result {
            Ok(output) => Self::Ok(output),
            Err(err) => match err.status_code() {
                StatusCode::INTERNAL_SERVER_ERROR => Response::ServerError(err),
                _ => Response::ClientError(err),
            },
        }
    }
}

// impl<T: BuildResponse, E: Into<Error>> FromResidual<Result<std::convert::Infallible, E>> for Response<T, E> {
//     fn from_residual(residual: Result<std::convert::Infallible, E>) -> Self {
//         todo!()
//     }
// }

// impl<T, E> Try for Response<T, E> where T: BuildResponse, E: BuildError {
//     type Ok = T;
//     type Error = E;
//     fn from_ok(v: T) -> Self {
//         Self::Ok(v)
//     }
//     fn from_error(err: Self::Error) -> Self {
//         match err.status_code() {
//             StatusCode::INTERNAL_SERVER_ERROR => Response::ServerError(err),
//             _ => Response::ClientError(err)
//         }
//     }
//     fn into_result(self) -> Result<T, Self::Error> {
//         match self {
//             Response::Ok(v) => Ok(v),
//             Response::ClientError(err) => Err(err),
//             Response::ServerError(err) => Err(err),
//         }
//     }
// }

impl<T: Serialize> Response<T, Error> {
    pub async fn into_service_response(
        self,
        request: ServiceRequest,
    ) -> actix_web::Result<ServiceResponse> {
        let (http_request, payload) = request.into_parts();
        let response = self.respond_to(&http_request);
        Ok(ServiceRequest::from_parts(http_request, payload).into_response(response))
    }
}

// impl<T : BuildResponse> From<Result<T, Error>> for Response<T> {
//     fn from(result: Result<T, Error>) -> Self {
//         match result {
//             Ok(data) => Response::Ok(data),
//             Err(err) => match err.status_code() {
//                 StatusCode::INTERNAL_SERVER_ERROR => Response::ServerError(err),
//                 _ => Response::ClientError(err)
//             },
//         }
//     }
// }

pub async fn run<R: BuildResponse, F: Future<Output = Result<R, Error>>>(
    func: F,
) -> Response<R, Error> {
    let result = func.await;
    Response::<R>::from(result)
}

#[actix_web::get("/")]
async fn get_foo() -> Response<Option<u32>> {
    run(async move {
        Err(Error::Web(actix_web::error::ErrorInternalServerError("")))?;
        Ok(Some(1_u32))
    })
    .await
}
