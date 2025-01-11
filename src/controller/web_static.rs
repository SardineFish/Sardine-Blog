use std::path::PathBuf;

use actix_files as fs;
use actix_http::{header, StatusCode};
use actix_web::{get, CustomizeResponder};
use actix_web::{
    web::{self, scope, Query, ServiceConfig},
    HttpRequest, HttpResponse, Responder,
};
use fs::NamedFile;
use sar_blog::model::PidType;
use serde::Deserialize;
use shared::ServiceOptions;

use super::extractor;

pub fn concat_path(paths: &[&str]) -> PathBuf {
    let path: PathBuf = paths.iter().collect();
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
    Ok(NamedFile::open(concat_path(&[
        &options.web_root,
        "account/login.html",
    ]))?)
}
static_file!(register, "/account/register", "account/register.html");
static_file!(signup, "/account/signup", "account/register.html");

#[derive(Deserialize)]
struct PidQuery {
    pid: Option<PidType>,
}

// static_file!(blog_index, "/blog/", "blog/blog.html");
static_file!(blog_view, r"/blog/{pid:\d+}", "blog/dist/view.html");
static_file!(blog_preview, r"/blog/preview", "blog/dist/view.html");
static_file!(
    blog_edit_pid,
    r"/blog/edit/{pid:\d+}",
    "blog/dist/editor.html"
);
static_file!(blog_edit, r"/blog/edit", "blog/dist/editor.html");
static_file!(note_view, r"/note/{pid:\d+}", "note/index.html");

#[get("/blog/")]
async fn blog_index(
    service: extractor::Service,
    options: extractor::Options,
    query: Query<PidQuery>,
    request: HttpRequest,
) -> actix_web::Result<HttpResponse> {
    if let Some(pid) = query.pid {
        Ok(HttpResponse::build(StatusCode::PERMANENT_REDIRECT)
            .append_header((header::LOCATION, service.url().blog(pid)))
            .body(""))
    } else {
        Ok(
            NamedFile::open(concat_path(&[&options.web_root, "blog/dist/index.html"]))?
                .into_response(&request),
        )
    }
}

static_file!(
    unsubscribe_notification,
    r"/notification/unsubscribe/{uid:[_A-Za-z0-9]{6,40}}",
    "notification/unsubscribe/index.html"
);

async fn notfound_page(
    options: extractor::Options,
) -> actix_web::Result<CustomizeResponder<NamedFile>> {
    Ok(
        NamedFile::open(concat_path(&[&options.web_root, "static/error/404.html"]))?
            .customize()
            .with_status(StatusCode::NOT_FOUND),
    )
}

static_file!(search, "/search", "search/dist/index.html");

fn serve_folder(opts: &ServiceOptions, mount_path: &str, serve_from: &str) -> fs::Files {
    fs::Files::new(mount_path, concat_path(&[&opts.web_root, serve_from]))
        .index_file("index.html")
        .default_handler(web::route().to(notfound_page))
        .redirect_to_slash_directory()
}

static_file!(cook_with_pid, r"/cook/{pid:\d+}", "cook/dist/index.html");
static_file!(cook_page, r"/cook/", "cook/dist/index.html");

static_file!(
    gallery_with_pid,
    r"/gallery/{pid:\d+}",
    "gallery/dist/index.html"
);
static_file!(gallery_page, r"/gallery/", "gallery/dist/index.html");

pub fn config(opts: ServiceOptions) -> impl FnOnce(&mut ServiceConfig) {
    move |cfg: &mut ServiceConfig| {
        cfg.service(
            scope("")
                .configure(super::rss_feed::config)
                .service(login_index)
                .service(register)
                .service(signup)
                .service(blog_view)
                .service(blog_preview)
                .service(blog_index)
                .service(blog_edit)
                .service(blog_edit_pid)
                .service(note_view)
                .service(unsubscribe_notification)
                .service(search)
                .service(cook_with_pid)
                .service(cook_page)
                .service(gallery_page)
                .service(gallery_with_pid)
                .service(serve_folder(&opts, "/gallery/", "gallery/dist/"))
                .service(serve_folder(&opts, "/cook/", "cook/dist/"))
                .service(serve_folder(&opts, "/search/", "search/dist/"))
                .service(serve_folder(&opts, "/blog/edit/", "blog/dist/"))
                .service(serve_folder(&opts, "/blog/", "blog/dist/"))
                .service(serve_folder(&opts, "/", "")),
        );
    }
}
