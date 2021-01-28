use mongodb::{bson, error::Error as MongoError};
use redis::RedisError;

use crate::model::PidType;

pub enum Error
{
    DBError(MongoError),
    PostNotFound(PidType),
    UserNotFound(String),
    DeserializeError(bson::de::Error),
    SerializeError(bson::ser::Error),
    RedisError(RedisError),
}

pub type Result<T> = std::result::Result<T, Error>;

impl From<MongoError> for Error
{
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

impl From<RedisError> for Error {
    fn from(err: RedisError) -> Self {
        Error::RedisError(err)
    }
}

pub trait MapError<T>
{
    fn map_model_result(self) -> Result<T>;
}

impl<E, T> MapError<T> for std::result::Result<T, E> where E: Into<Error>
{
    fn map_model_result(self) -> Result<T> {
        self.map_err(E::into)
    }
}