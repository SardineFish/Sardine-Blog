use std::fmt;

use actix_http::http::StatusCode;
use sar_blog::Error as ServiceError;


#[derive(Debug)]
pub enum Error {
    ServiceError(sar_blog::Error),
    WebError(actix_web::Error),
    SerializeError,
}

impl Error {
    pub fn code(&self) -> u64 {
        match self {
            Error::SerializeError => 0x0100_0000,
            Error::WebError(_) => 0x0200_0000,
            Error::ServiceError(err) => 0x0300_0000 | err.code(),
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
            Error::ServiceError(ServiceError::PasswordIncorrect) => StatusCode::FORBIDDEN,
            Error::ServiceError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Error")
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