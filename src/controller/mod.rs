mod extractor;
mod note;
mod blog;
mod comment;
mod user;
mod executor;
mod web_static;
mod post_data;
mod storage;

use actix_web::web::{ServiceConfig, scope};
use options::ServiceOptions;

use crate::middleware;

pub fn config(opts: ServiceOptions) -> impl FnOnce(&mut ServiceConfig)->() {
    move |cfg: &mut ServiceConfig| {
        cfg.service(scope("/api")
            .configure(blog::config)
            .configure(comment::config)
            .configure(note::config)
            .configure(user::config)
            .configure(post_data::config)
            .configure(storage::config)
            .wrap(middleware::session())
        ).service(scope("").configure(web_static::config(opts.clone())));
    }
}