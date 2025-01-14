use std::fmt::{self, Display};

use mongodb::{bson, error::Error as MongoError};
use redis::RedisError;

use crate::model::PidType;

#[derive(Debug)]
pub enum Error {
    DBError(MongoError),
    PostNotFound(PidType),
    UserNotFound(String),
    SessionNotFound(String),
    DeserializeError(bson::de::Error),
    SerializeError(bson::ser::Error),
    RedisError(RedisError),
    UserExisted(String),
    PostExisted(PidType),
    PostTypeMissmatch,
    BSONAccessError(bson::document::ValueAccessError),
    InternalError(&'static str),
    InternalErrorOwned(String),
}

impl Error {
    pub fn code(&self) -> u64 {
        match self {
            Error::DBError(_) => 0x01,
            Error::PostNotFound(_) => 0x02,
            Error::UserNotFound(_) => 0x03,
            Error::SessionNotFound(_) => 0x04,
            Error::DeserializeError(_) => 0x05,
            Error::SerializeError(_) => 0x06,
            Error::RedisError(_) => 0x07,
            Error::UserExisted(_) => 0x08,
            Error::PostExisted(_) => 0x09,
            Error::PostTypeMissmatch => 0x0a,
            Error::BSONAccessError(_) => 0x0b,
            Error::InternalError(_) | Error::InternalErrorOwned(_) => 0xff,
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::PostNotFound(pid) => write!(f, "Post of pid '{}' not exists", pid),
            Error::UserNotFound(uid) => write!(f, "User of uid '{}' not exists", uid),
            Error::UserExisted(uid) => write!(f, "User of uid '{}' already existed", uid),
            Error::PostExisted(pid) => write!(f, "Post of pid '{}' already existed", pid),
            _ => write!(f, "Internal Server Error"),
        }
    }
}

pub type Result<T> = std::result::Result<T, Error>;

impl From<MongoError> for Error {
    fn from(err: MongoError) -> Error {
        Error::DBError(err)
    }
}

impl From<bson::de::Error> for Error {
    fn from(err: bson::de::Error) -> Self {
        Error::DeserializeError(err)
    }
}

impl From<bson::ser::Error> for Error {
    fn from(err: bson::ser::Error) -> Self {
        Error::SerializeError(err)
    }
}

impl From<bson::document::ValueAccessError> for Error {
    fn from(err: bson::document::ValueAccessError) -> Self {
        Error::BSONAccessError(err)
    }
}

impl From<RedisError> for Error {
    fn from(err: RedisError) -> Self {
        Error::RedisError(err)
    }
}

pub trait MapError<T> {
    fn map_model_result(self) -> Result<T>;
}

impl<E, T> MapError<T> for std::result::Result<T, E>
where
    E: Into<Error>,
{
    fn map_model_result(self) -> Result<T> {
        self.map_err(E::into)
    }
}

pub trait MapInternalError<T>: Sized {
    fn map_internal_err(self) -> Result<T>;
    fn map_search_err(self, _log_msg: &str) -> Result<T> {
        self.map_internal_err()
    }
}

impl<E, T> MapInternalError<T> for std::result::Result<T, E>
where
    E: Display,
{
    fn map_internal_err(self) -> Result<T> {
        match self {
            Ok(result) => Ok(result),
            Err(err) => Err(Error::InternalErrorOwned(format!(
                "Internal Error: {}",
                err
            ))),
        }
    }

    fn map_search_err(self, log_msg: &str) -> Result<T> {
        match self {
            Ok(result) => Ok(result),
            Err(err) => {
                log::error!("Search model error: {log_msg}");
                Err(Error::InternalErrorOwned(format!(
                    "Internal Error: {}",
                    err
                )))
            }
        }
    }
}
