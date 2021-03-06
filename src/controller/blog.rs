
use actix_web::{get, post, put, delete, web::{self, Path}};
use chrono::DateTime;
use sar_blog::{BlogPreview, model::{Blog, BlogContent, DocType, PidType, PostStats, PubUserInfo, Access}};
use serde::{Serialize, Deserialize};
use web::{Query, ServiceConfig, scope};

use crate::{error::*, middleware, misc::response::Response};
use sar_blog::utils::json_datetime_format;

use super::{extractor};

#[derive(Deserialize)]
struct QueryParams {
    #[serde(default = "default_from")]
    from: usize,
    #[serde(default = "default_count")]
    count: usize,
}

fn default_from() -> usize {
    0
}
fn default_count() -> usize {
    10
}

#[derive(Serialize)]
struct PubBlog {
    pid: PidType,
    title: String,
    author: PubUserInfo,
    #[serde(with="json_datetime_format")]
    time: DateTime<chrono::Utc>,
    tags: Vec<String>,
    doc_type: DocType,
    doc: String,
    stats: PostStats,
}

impl From<Blog> for PubBlog {
    fn from(blog: Blog) -> Self {
        Self {
            pid: blog.pid,
            author: blog.author,
            doc: blog.doc,
            doc_type: blog.doc_type,
            stats: blog.stats,
            tags: blog.tags,
            time: blog.time.into(),
            title: blog.title,
        }
    }
}

#[get("")]
async fn get_list(service: extractor::Service, Query(params): Query<QueryParams>) -> Response<Vec<BlogPreview>> {
    service.blog().get_preview_list(params.from, params.count)
        .await
        .map_contoller_result()
        .into()
}

#[get("/{pid}")]
async fn get_by_pid(service: extractor::Service, Path(pid): Path<PidType>, session: extractor::Session) -> Response<PubBlog> {
    let blog = service.blog().get_by_pid(session.id(), pid).await.map_contoller_result()?;
    Ok(PubBlog::from(blog)).into()
}

#[post("", wrap="middleware::authentication(Access::Trusted)")]
async fn post(service: extractor::Service, auth: extractor::Auth, data: web::Json<BlogContent>) -> Response<PidType> {
    let pid = service.blog().post(&auth.uid, data.to_owned()).await.map_contoller_result()?;
    Ok(pid).into()
}


#[put("/{pid}", wrap="middleware::authentication(Access::Trusted)")]
async fn update(service: extractor::Service, auth: extractor::Auth, data: web::Json<BlogContent>, Path(pid): Path<PidType>) -> Response<PidType> {
    service.blog().update(pid, &auth.uid, data.to_owned())
        .await
        .map_contoller_result()?;
    Ok(pid).into()
}

#[delete("/{pid}", wrap="middleware::authentication(Access::Trusted)")]
async fn delete(service: extractor::Service, auth: extractor::Auth, Path(pid): Path<PidType>) -> Response<Option<BlogContent>> {
    let blog = service.blog().delete(&auth.uid, pid)
        .await
        .map_contoller_result()?;
    
    Ok(blog).into()
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg
        .service(
        scope("/blog")
            .service(get_list)
            .service(get_by_pid)
            .service(post)
            .service(update)
            .service(delete)
        );
}
