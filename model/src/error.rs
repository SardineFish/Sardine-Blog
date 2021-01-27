use mongodb::error::Error as MongoError;

pub enum Error
{
    DBError(MongoError),

}

pub type Result<T> = std::result::Result<T, Error>;

impl From<MongoError> for Error
{
    fn from(err: MongoError) -> Error {
        Error::DBError(err)
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