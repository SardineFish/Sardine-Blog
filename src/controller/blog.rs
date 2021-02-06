use std::ops::Deref;

use actix_web::{get, post, put, delete, web::{self, Path}};
use chrono::DateTime;
use sar_blog::{BlogPreview, model::{Blog, BlogContent, DocType, PidType, PostStats}};
use serde::{Serialize, Deserialize};
use web::{Query, ServiceConfig, scope};

use crate::{error::*, middleware, misc::response::Response};
use sar_blog::utils::json_datetime_format;

use super::{executor::execute, extractor};

#[derive(Deserialize)]
struct QueryParams {
    from: usize,
    count: usize,
}

#[derive(Serialize)]
struct PubBlog {
    pid: PidType,
    title: String,
    author: String,
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
    execute(async move {
        service.blog().get_preview_list(params.from, params.count).await.map_contoller_result()
    }).await
}

#[get("/{pid}")]
async fn get_by_pid(service: extractor::Service, Path(pid): Path<PidType>, session: extractor::Session) -> Response<PubBlog> {
    execute(async move {
        let blog = service.blog().get_by_pid(session.id(), pid).await.map_contoller_result()?;
        Ok(PubBlog::from(blog))
    }).await
}

#[post("", wrap="middleware::authentication()")]
async fn post(service: extractor::Service, auth: extractor::Auth, data: web::Json<BlogContent>) -> Response<PidType> {
    execute(async move {
        let pid = service.blog().post(&auth.uid, data.deref()).await.map_contoller_result()?;
        Ok(pid)
    }).await
}


#[put("/{pid}", wrap="middleware::authentication()")]
async fn update(service: extractor::Service, auth: extractor::Auth, data: web::Json<BlogContent>, Path(pid): Path<PidType>) -> Response<PidType> {
    execute(async move {
        service.blog().update(pid, &auth.uid, &data)
            .await
            .map_contoller_result()?;
        Ok(pid)
    }).await
}

#[delete("/{pid}", wrap="middleware::authentication()")]
async fn delete(service: extractor::Service, auth: extractor::Auth, Path(pid): Path<PidType>) -> Response<Option<PubBlog>> {
    execute(async move {
        let blog = service.blog().delete(&auth.uid, pid)
            .await
            .map_contoller_result()?;
        
        Ok(blog.map(PubBlog::from))
    }).await
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
