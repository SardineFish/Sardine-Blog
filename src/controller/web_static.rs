use std::path::PathBuf;

use actix_http::http::{HeaderValue, StatusCode, header};
use actix_web::{HttpRequest, middleware::errhandlers::{ErrorHandlerResponse, ErrorHandlers}, web::{self, HttpResponse, Query, ServiceConfig, scope}};
use actix_web::{get};
use fs::{ NamedFile};
use options::ServiceOptions;
use actix_files as fs;
use sar_blog::model::PidType;
use serde::Deserialize;

use super::extractor;

pub fn concat_path(paths: &[&str]) -> PathBuf {
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

#[derive(Deserialize)]
struct PidQuery {
    pid: Option<PidType>,
}

// static_file!(blog_index, "/blog/", "blog/blog.html");
static_file!(blog_view, r"/blog/{pid:\d+}", "blog/blogView.html");
static_file!(note_view, r"/note/{pid:\d+}", "note/index.html");

#[get("/blog/")]
async fn blog_index(
    service: extractor::Service, 
    options: extractor::Options, 
    query: Query<PidQuery>,
    request: HttpRequest)
 -> actix_web::Result<HttpResponse> {
    if let Some(pid) = query.pid {
        Ok(HttpResponse::build(StatusCode::PERMANENT_REDIRECT)
            .header(header::LOCATION, service.url().blog(pid))
            .body(""))
    } else {
        Ok(NamedFile::open(concat_path(&[&options.web_root, "blog/blog.html"]))?.into_response(&request)?)
    }
}



static_file!(unsubscribe_notification, r"/notification/unsubscribe/{uid:[_A-Za-z0-9]{6,40}}", "notification/unsubscribe/index.html");




async fn notfound_page(options: extractor::Options) -> actix_web::Result<NamedFile> {
    Ok(NamedFile::open(concat_path(&[&options.web_root, "404.html"]))?)
}


pub fn config(opts: ServiceOptions) -> impl FnOnce(&mut ServiceConfig)->() {
    move |cfg: &mut ServiceConfig| {
        cfg.service(scope("")
            .service(login_index)
            .service(register)
            .service(signup)
            .service(blog_view)
            .service(blog_index)
            .service(note_view)
            .service(unsubscribe_notification)
            .service(fs::Files::new("/", &opts.web_root)
                .index_file("index.html")
                .default_handler(web::route().to(notfound_page))
                .redirect_to_slash_directory()
            )
        );
    }
}