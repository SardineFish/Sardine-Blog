mod extractor;
mod note;
mod blog;
mod comment;
mod user;
mod executor;

use actix_web::web::{ServiceConfig, scope};

use crate::middleware;

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/api")
        .configure(blog::config)
        .configure(comment::config)
        .configure(note::config)
        .configure(user::config)
        .wrap(middleware::session())
    );
}