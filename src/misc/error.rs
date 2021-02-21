use std::fmt;

use actix_http::http::StatusCode;
use fmt::{Debug, Display};
use sar_blog::Error as ServiceError;


#[derive(Debug)]
pub enum Error {
    ServiceError(sar_blog::Error),
    WebError(actix_web::Error),
    SerializeError,
    UncaughtError(String),
}

impl Error {
    pub fn code(&self) -> u64 {
        match self {
            Error::SerializeError => 0x0001_0000,
            Error::WebError(_) => 0x0002_0000,
            Error::ServiceError(err) => 0x0003_0000 | err.code(),
            Error::UncaughtError(_) => 0x0004_0000,
        }
    }
    pub fn status_code(&self) -> StatusCode {
        match self {
            Error::SerializeError => StatusCode::INTERNAL_SERVER_ERROR,
            Error::WebError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Error::ServiceError(ServiceError::DataNotFound(_)) => StatusCode::NOT_FOUND,
            Error::ServiceError(ServiceError::DataConflict(_)) => StatusCode::BAD_REQUEST,
            Error::ServiceError(ServiceError::InvalidParams(_)) => StatusCode::BAD_REQUEST,
            Error::ServiceError(ServiceError::InvalidChallenge) => StatusCode::BAD_REQUEST,
            Error::ServiceError(ServiceError::Unauthorized) => StatusCode::FORBIDDEN,
            Error::ServiceError(ServiceError::AccessDenied) => StatusCode::FORBIDDEN,
            Error::ServiceError(ServiceError::PasswordIncorrect) => StatusCode::FORBIDDEN,
            Error::ServiceError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Error::UncaughtError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
    pub fn invalid_params(msg: &str) -> Error {
        Error::ServiceError(ServiceError::InvalidParams(msg.to_string()))
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::ServiceError(err) => fmt::Display::fmt(&err, f),
            Error::SerializeError | Error::WebError(_) => write!(f, "Internal Error"),
            Error::UncaughtError(err) => fmt::Display::fmt(err, f),
        }
    }
}

pub type Result<T> = std::result::Result<T, Error>;


pub trait MapControllerError<T> {
    fn map_contoller_result(self) -> Result<T>;
}

impl<T> MapControllerError<T> for std::result::Result<T, ServiceError> {
    fn map_contoller_result(self) -> Result<T> {
        match self {
            Ok(x) => Ok(x),
            Err(err) => Err(Error::ServiceError(err))
        }
    }
}

pub trait OkOrLog<T> {
    fn ok_or_log_error(self) -> Option<T>;
    fn ok_or_error<M: Display>(self, msg: M) -> Option<T>;
    fn ok_or_warn<M: Display>(self, msg: M) -> Option<T>;
    fn ok_or_info<M: Display>(self, msg: M) -> Option<T>;
}

impl<T, E: Debug> OkOrLog<T> for std::result::Result<T, E> {
    fn ok_or_log_error(self) -> Option<T> {
        match self {
            Ok(val) => Some(val),
            Err(err) => {
                log::error!("{:?}", err);
                None
            }
        }
    }
    fn ok_or_error<M: Display>(self, msg: M) -> Option<T> {
        match self {
            Ok(val) => Some(val),
            Err(_) => {
                log::error!("{}", msg);
                None
            }
        }
    }
    fn ok_or_warn<M: Display>(self, msg: M) -> Option<T> {
        match self {
            Ok(val) => Some(val),
            Err(_) => {
                log::warn!("{}", msg);
                None
            }
        }
    }
    fn ok_or_info<M: Display>(self, msg: M) -> Option<T> {
        match self {
            Ok(val) => Some(val),
            Err(_) => {
                log::info!("{}", msg);
                None
            }
        }
    }
}