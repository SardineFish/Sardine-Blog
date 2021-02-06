use futures::Future;
use serde::Serialize;

use crate::misc::{error, response::{BuildResponse, Response}};

pub async fn execute<R : BuildResponse, F: Future<Output = Result<R, error::Error>>>(func: F) -> Response<R> {
    let result = func.await;
    Response::<R>::from(result)
}