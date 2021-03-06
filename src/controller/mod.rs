mod extractor;
mod note;
mod blog;
mod comment;
mod user;
mod web_static;
mod post_data;
mod storage;
mod search;
mod test;
mod rank;
mod cors;

use actix_web::{ web::{ ServiceConfig, scope}};
use shared::ServiceOptions;

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
            .configure(test::config)
            .configure(search::config)
            .wrap(middleware::session())
            .configure(rank::config)
            .wrap(middleware::error_formatter())
        ).service(scope("")
            .configure(web_static::config(opts.clone()))
        );
    }
}