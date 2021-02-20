mod extractor;
mod note;
mod blog;
mod comment;
mod user;
mod executor;
mod web_static;
mod post_data;
mod storage;
mod test;

use actix_files::NamedFile;
use actix_web::{get, web::{self, ServiceConfig, scope}};
use options::ServiceOptions;

use crate::middleware;

use self::web_static::concat_path;

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
            .wrap(middleware::session())
            .wrap(middleware::error_formatter())
        ).service(scope("")
            .configure(web_static::config(opts.clone()))
        );
    }
}

// #[get("")]
async fn notfound_page(options: extractor::Options) -> actix_web::Result<NamedFile> {
    Ok(NamedFile::open(concat_path(&[&options.web_root, "404.html"]))?)
}