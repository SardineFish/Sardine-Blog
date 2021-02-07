use actix_web::{HttpRequest, get, post, web};
use chrono::{DateTime, Utc};
use futures::Future;
use sar_blog::model::{AnonymousUserInfo, DocType, Note, NoteContent, PidType, PostStats, PubUserInfo, SessionAuthInfo};
use sar_blog::utils::json_datetime_format;
use serde::{Serialize, Deserialize};
use web::{Json, Query, ServiceConfig, scope};

use crate::error::*;
use crate::{middleware, misc::response::Response};

use super::{executor::execute, extractor::{self, ExtensionMove}};

#[derive(Serialize)]
struct PubNote {
    pid: PidType,
    author: PubUserInfo,
    #[serde(with="json_datetime_format")]
    time: DateTime<Utc>,
    doc_type: DocType,
    doc: String,
    stats: PostStats,
}

impl From<Note> for PubNote {
    fn from(note: Note) -> Self {
        Self{
            pid: note.pid,
            author: note.author,
            doc: note.doc,
            doc_type: note.doc_type,
            time: note.time.into(),
            stats: note.stats
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
async fn get_list(service: extractor::Service, Query(params): Query<QueryParams>) -> Response<Vec<PubNote>>{
    execute(async move {
        let list = service.note().get_list(params.from, params.count)
            .await
            .map_contoller_result()?;
        let list = list.into_iter()
            .map(PubNote::from)
            .collect();
        Ok(list)
    }).await
}

#[post("")]
async fn post(service: extractor::Service, session: extractor::Session, data: Json<NoteUpload>, request: HttpRequest) -> Response<PidType> {
    execute(async move {

        let auth = middleware::auth_from_request(&service, &request)
            .await?;
        let author_info = match auth {
            Some(_) => None,
            None => Some(AnonymousUserInfo {
                name: data.name.as_ref().ok_or(Error::invalid_params("Missing 'name'"))?.clone(),
                avatar: data.avatar.as_ref().ok_or(Error::invalid_params("Missing 'avatar'"))?.clone(),
                email: data.email.clone(),
                url: data.url.clone(),
            })
        };

        let content = NoteContent {
            doc_type: data.doc_type,
            doc: data.doc.clone()
        };

        let pid = service.note().post(session.id(), author_info.as_ref(), content)
            .await
            .map_contoller_result()?;
        Ok(pid)

    }).await
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/note")
        .service(get_list)
        .service(post)
    );
}