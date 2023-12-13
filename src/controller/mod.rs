mod blog;
mod comment;
mod cook;
mod cors;
mod extractor;
mod gallery;
mod note;
mod post_data;
mod rank;
mod search;
mod storage;
mod test;
mod user;
mod utils;
mod web_static;

use actix_web::web::{scope, ServiceConfig};
use shared::ServiceOptions;

use crate::middleware;

pub fn config(opts: ServiceOptions) -> impl FnOnce(&mut ServiceConfig) {
    move |cfg: &mut ServiceConfig| {
        cfg.service(
            scope("/api")
                .configure(blog::config)
                .configure(comment::config)
                .configure(note::config)
                .configure(cook::config)
                .configure(gallery::config)
                .configure(user::config)
                .configure(post_data::config)
                .configure(storage::config)
                .configure(test::config)
                .configure(search::config)
                .configure(rank::config)
                .wrap(middleware::session())
                .wrap(middleware::error_formatter()),
        )
        .service(scope("").configure(web_static::config(opts)));
    }
}
