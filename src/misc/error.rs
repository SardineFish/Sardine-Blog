use std::fmt;

use actix_http::StatusCode;
use fmt::{Debug, Display};
use sar_blog::Error as ServiceError;

pub(crate) trait ErrorStatusCode {
    fn status_code(&self) -> StatusCode;
}

#[derive(Debug)]
pub enum Error {
    Service(sar_blog::Error),
    Web(actix_web::Error),
    Serialize,
    Uncaught(String),
    Misc(StatusCode, &'static str),
}

impl ErrorStatusCode for Error {
    fn status_code(&self) -> StatusCode {
        match self {
            Error::Service(err) => match err {
                ServiceError::DataNotFound(_) => StatusCode::NOT_FOUND,
                ServiceError::DataConflict(_) => StatusCode::BAD_REQUEST,
                ServiceError::InvalidParams(_) => StatusCode::BAD_REQUEST,
                ServiceError::InvalidChallenge => StatusCode::BAD_REQUEST,
                ServiceError::Unauthorized => StatusCode::FORBIDDEN,
                ServiceError::AccessDenied => StatusCode::FORBIDDEN,
                ServiceError::PasswordIncorrect => StatusCode::FORBIDDEN,
                ServiceError::InvalidScore(_) => StatusCode::BAD_REQUEST,
                ServiceError::RateLimit => StatusCode::IM_A_TEAPOT,
                _ => StatusCode::INTERNAL_SERVER_ERROR,
            }
            Error::Serialize => StatusCode::INTERNAL_SERVER_ERROR,
            Error::Web(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Error::Uncaught(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Error::Misc(code, _) => code.to_owned(),
        }
    }
}

impl Error {
    pub fn code(&self) -> u64 {
        match self {
            Error::Serialize => 0x0001_0000,
            Error::Web(_) => 0x0002_0000,
            Error::Service(err) => 0x0003_0000 | err.code(),
            Error::Uncaught(_) => 0x0004_0000,
            Error::Misc(_, _) => 0x0005_0000,
        }
    }
    pub fn status_code(&self) -> StatusCode {
        match self {
            Error::Service(err) => match err {
                ServiceError::DataNotFound(_) => StatusCode::NOT_FOUND,
                ServiceError::DataConflict(_) => StatusCode::BAD_REQUEST,
                ServiceError::InvalidParams(_) => StatusCode::BAD_REQUEST,
                ServiceError::InvalidChallenge => StatusCode::BAD_REQUEST,
                ServiceError::Unauthorized => StatusCode::FORBIDDEN,
                ServiceError::AccessDenied => StatusCode::FORBIDDEN,
                ServiceError::PasswordIncorrect => StatusCode::FORBIDDEN,
                ServiceError::InvalidScore(_) => StatusCode::BAD_REQUEST,
                ServiceError::RateLimit => StatusCode::IM_A_TEAPOT,
                _ => StatusCode::INTERNAL_SERVER_ERROR,
            }
            Error::Serialize => StatusCode::INTERNAL_SERVER_ERROR,
            Error::Web(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Error::Uncaught(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Error::Misc(code, _) => code.to_owned(),
        }
    }
    pub fn invalid_params(msg: &str) -> Error {
        Error::Service(ServiceError::InvalidParams(msg.to_string()))
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Service(err) => fmt::Display::fmt(&err, f),
            Error::Serialize | Error::Web(_) => write!(f, "Internal Error"),
            Error::Uncaught(err) => fmt::Display::fmt(err, f),
            Error::Misc(_, msg) => fmt::Display::fmt(msg, f),
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
            Err(err) => Err(Error::Service(err))
        }
    }
}

impl From<ServiceError> for Error {
    fn from(err: ServiceError) -> Self {
        Error::Service(err)
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