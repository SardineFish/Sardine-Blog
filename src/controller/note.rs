use actix_web::{get, post, web, HttpRequest};
use chrono::{DateTime, Utc};
use sar_blog::utils::json_datetime_format;
use sar_blog::{
    model::{AnonymousUserInfo, DocType, Note, NoteContent, PidType, PostStats, PubUserInfo},
    Author,
};
use serde::{Deserialize, Serialize};
use web::{scope, Json, Query, ServiceConfig};

use crate::error::*;
use crate::utils::EmptyAsNone;
use crate::{middleware, misc::response::Response};

use super::extractor;
use Response::Ok;

#[derive(Serialize)]
struct PubNote {
    pid: PidType,
    author: PubUserInfo,
    #[serde(with = "json_datetime_format")]
    time: DateTime<Utc>,
    doc_type: DocType,
    doc: String,
    stats: PostStats,
}

impl From<Note> for PubNote {
    fn from(note: Note) -> Self {
        Self {
            pid: note.pid,
            author: note.author,
            doc: note.content.doc,
            doc_type: note.content.doc_type,
            time: note.time.into(),
            stats: note.stats,
        }
    }
}

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

#[derive(Deserialize)]
struct NoteUpload {
    name: Option<String>,
    email: Option<String>,
    url: Option<String>,
    avatar: Option<String>,
    doc_type: DocType,
    doc: String,
}

#[get("")]
async fn get_list(
    service: extractor::Service,
    Query(params): Query<QueryParams>,
) -> Response<Vec<PubNote>> {
    let list = service
        .note()
        .get_list(params.from, params.count)
        .await
        .map_contoller_result()?;
    let list = list.into_iter().map(PubNote::from).collect();
    Ok(list)
}

#[post("")]
async fn post(
    service: extractor::Service,
    data: Json<NoteUpload>,
    request: HttpRequest,
) -> Response<PidType> {
    let auth = middleware::auth_from_request(&service, &request).await?;
    let author = match auth {
        Some(auth) => Author::Authorized(auth),
        None => Author::Anonymous(AnonymousUserInfo {
            name: data
                .name
                .as_ref()
                .empty_as_none()
                .ok_or_else(|| Error::invalid_params("Missing 'name'"))?
                .clone(),
            avatar: data
                .avatar
                .as_ref()
                .empty_as_none()
                .ok_or_else(|| Error::invalid_params("Missing 'avatar'"))?
                .clone(),
            email: data.email.clone().empty_as_none(),
            url: data.url.clone().empty_as_none(),
        }),
    };

    let content = NoteContent {
        doc_type: data.doc_type,
        doc: data.doc.clone(),
    };

    let pid = service
        .note()
        .post(author, content)
        .await
        .map_contoller_result()?;

    Ok(pid)
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/note").service(get_list).service(post));
}
