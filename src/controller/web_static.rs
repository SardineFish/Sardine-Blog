use std::path::PathBuf;

use actix_web::web::{ ServiceConfig, Path};
use actix_web::{get};
use fs::{ NamedFile};
use options::ServiceOptions;
use actix_files as fs;
use sar_blog::model::PidType;

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

static_file!(register, "/account/register", "account/register.html");
static_file!(signup, "/account/signup", "account/register.html");
static_file!(blog_index, "/blog/", "blog/blog.html");
#[get("/blog/{pid}")]
async fn blog_view(Path(pid): Path<String>, options: extractor::Options) -> actix_web::Result<NamedFile> {
    if let Ok(_) = pid.parse::<PidType>() {
        Ok(NamedFile::open(concat_path(&[&options.web_root, "blog/blogView.html"]))?)
    } else {
        Ok(NamedFile::open(concat_path(&[&options.web_root, "blog", &pid]))?)
    }
}

#[get("/account/login")]
async fn login_index(options: extractor::Options) -> actix_web::Result<NamedFile> {
    Ok(NamedFile::open(concat_path(&[&options.web_root, "account/login.html"]))?)
}

pub fn config(opts: ServiceOptions) -> impl FnOnce(&mut ServiceConfig)->() {
    move |cfg: &mut ServiceConfig| {
        cfg.service(login_index)
            .service(register)
            .service(signup)
            .service(blog_view)
            .service(blog_index)
        .service(fs::Files::new("/", &opts.web_root).index_file("index.html"))
            ;
    }
}