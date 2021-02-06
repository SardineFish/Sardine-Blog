use actix_web::{get, post, web};
use chrono::{DateTime, Utc};
use futures::Future;
use sar_blog::model::{AnonymousUserInfo, DocType, Note, PidType, PostStats, SessionAuthInfo};
use sar_blog::utils::json_datetime_format;
use serde::{Serialize, Deserialize};
use web::{Json, Query, ServiceConfig, scope};

use crate::error::*;
use crate::{middleware, misc::response::Response};

use super::{executor::execute, extractor::{self, ExtensionMove}};

#[derive(Serialize)]
struct PubNote {
    pid: PidType,
    author: String,
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
    name: String,
    email: Option<String>,
    url: Option<String>,
    avatar: String,
    doc_type: DocType,
    doc: String,
}

#[get("/")]
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

#[post("/")]
async fn post(service: extractor::Service, session: extractor::Session, data: Json<NoteUpload>) -> Response<PidType> {
    execute(async move {
        let author_info: AnonymousUserInfo = AnonymousUserInfo {
            avatar: data.avatar.clone(),
            email: data.email.clone(),
            name: data.name.clone(),
            url: data.url.clone(),
        };

        let pid = service.note().post(session.id(), &author_info, data.doc_type, &data.doc)
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