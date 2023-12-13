use actix_web::{
    get,
    web::{scope, ServiceConfig},
};

use crate::misc::response::{NoContent, Response};

#[get("/error_report")]
async fn test_error_report() -> Response<NoContent> {
    log::error!("Nothing error.");
    Response::Ok(NoContent)
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/test").service(test_error_report));
}
