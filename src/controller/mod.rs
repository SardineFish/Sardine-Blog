mod extractor;
mod note;
mod blog;
mod comment;
mod executor;

use actix_web::web::{ServiceConfig, scope};

use crate::middleware;

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/api")
        .wrap(middleware::session())
    );
}