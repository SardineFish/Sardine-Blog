use std::fmt;

use model::{Error as ModelError, PidType};

#[derive(Debug)]
pub enum Error {
    InvalidParams(String),
    DataNotFound(ModelError),
    InternalModelError(ModelError),
    InternalServiceError(&'static str),
    InternalServiceErrorOwned(String),
    ExternalServiceError(String),
    Unauthorized,
    PasswordIncorrect,
    DataConflict(ModelError),
    InvalidChallenge,
    AccessDenied,
    InvalidScore(&'static str),
    RateLimit,
}

impl Error {
    pub fn code(&self) -> u64 {
        match self {
            Error::InvalidParams(_) => 0x0100,
            Error::DataNotFound(err) => 0x0200 | err.code(),
            Error::InternalModelError(err) => 0x0300 | err.code(),
            Error::Unauthorized => 0x0400,
            Error::PasswordIncorrect => 0x0500,
            Error::InternalServiceError(_) | Error::InternalServiceErrorOwned(_) => 0x0600,
            Error::DataConflict(_) => 0x0700,
            Error::InvalidChallenge => 0x0800,
            Error::AccessDenied => 0x0900,
            Error::ExternalServiceError(_) => 0x0a00,
            Error::InvalidScore(_) => 0x0b00,
            Error::RateLimit => 0x0c00,
        }
    }
    pub fn post_not_found(pid: PidType) -> Self {
        Error::DataNotFound(model::Error::PostNotFound(pid))
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::InvalidParams(str) => fmt::Display::fmt(str, f),
            Error::DataNotFound(err) | Error::DataConflict(err) => fmt::Display::fmt(err, f),
            Error::Unauthorized => write!(f, "Unauthorized"),
            Error::PasswordIncorrect => write!(f, "Password incorrect"),
            Error::InvalidChallenge => write!(f, "Invalid challenge"),
            Error::InternalModelError(err) => fmt::Display::fmt(err, f),
            Error::AccessDenied => fmt::Display::fmt("Access Denied", f),
            Error::InvalidScore(msg) => fmt::Display::fmt(msg, f),
            Error::RateLimit => write!(f, "Request too frequently"),
            _ => write!(f, "Internal Server Error"),
        }
    }
}

pub type Result<T> = std::result::Result<T, Error>;

impl From<ModelError> for Error {
    fn from(err: ModelError) -> Self {
        match err {
            ModelError::PostNotFound(_) | ModelError::UserNotFound(_) => Error::DataNotFound(err),
            ModelError::UserExisted(_) | ModelError::PostExisted(_) => Error::DataConflict(err),
            _ => Error::InternalModelError(err),
        }
    }
}

pub trait MapServiceError<T> {
    fn map_service_err(self) -> std::result::Result<T, Error>;
}

impl<T, E> MapServiceError<T> for std::result::Result<T, E>
where
    E: Into<Error>,
{
    fn map_service_err(self) -> std::result::Result<T, Error> {
        self.map_err(E::into)
    }
}
