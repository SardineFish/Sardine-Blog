use futures::Future;
use serde::Serialize;

use crate::misc::{error, response::Response};

pub async fn execute<R : Serialize, F: Future<Output = Result<R, error::Error>>>(func: F) -> Response<R> {
    let result = func.await;
    Response::<R>::from(result)
}