use std::path::PathBuf;

use actix_web::web::{ ServiceConfig};
use actix_web::{get};
use fs::{ NamedFile};
use options::ServiceOptions;
use actix_files as fs;

use super::extractor;

fn concat_path(paths: &[&str]) -> PathBuf {
    let path: PathBuf = paths.into_iter().collect();
    path
}

macro_rules! static_file {
    ($name: ident, $url: expr, $file: expr) => {
        #[get($url)]
        async fn $name(options: extractor::Options) -> actix_web::Result<NamedFile> {
            Ok(NamedFile::open(concat_path(&[&options.web_root, $file]))?)
        }
    };
}

#[get("/account/login")]
async fn login_index(options: extractor::Options) -> actix_web::Result<NamedFile> {
    Ok(NamedFile::open(concat_path(&[&options.web_root, "account/login.html"]))?)
}
static_file!(register, "/account/register", "account/register.html");
static_file!(signup, "/account/signup", "account/register.html");


static_file!(blog_index, "/blog/", "blog/blog.html");
static_file!(blog_view, r"/blog/{pid:\d+}", "blog/blogView.html");


static_file!(unsubscribe_notification, r"/notification/unsubscribe/{uid:[_A-Za-z0-9]{6,32}}", "notification/unsubscribe/index.html");


pub fn config(opts: ServiceOptions) -> impl FnOnce(&mut ServiceConfig)->() {
    move |cfg: &mut ServiceConfig| {
        cfg.service(login_index)
            .service(register)
            .service(signup)
            .service(blog_view)
            .service(blog_index)
            .service(unsubscribe_notification)
        .service(fs::Files::new("/", &opts.web_root).index_file("index.html"))
            ;
    }
}