use model::{Error as ModelError, PidType};

pub enum Error {
    InvalidParams(String),
    DataNotFound(ModelError),
    InternalModelError(ModelError),
    Unauthorized,
    PasswordIncorrect,
}

impl Error {
    pub fn post_not_found(pid: PidType) -> Self {
        Error::DataNotFound(model::Error::PostNotFound(pid))
    }
}

pub type Result<T> = std::result::Result<T, Error>;

impl From<ModelError> for Error {
    fn from(err: ModelError) -> Self {
        match err {
            ModelError::PostNotFound(_) | ModelError::UserNotFound(_) => Error::DataNotFound(err),
            _ => Error::InternalModelError(err),
        }
    }
}

pub trait MapServiceError<T> {
    fn map_service_err(self) -> std::result::Result<T, Error>;
}

impl<T, E> MapServiceError<T> for std::result::Result<T, E> where E : Into<Error> {
    fn map_service_err(self) -> std::result::Result<T, Error> {
        self.map_err(E::into)
    }
}