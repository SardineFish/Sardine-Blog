use actix_web::{delete, get, post, web::{Json, Path, Query, ServiceConfig, scope}};
use chrono::DateTime;
use sar_blog::{NestedCommentRef, model::{AnonymousUserInfo, Comment, PidType}};
use serde::{Serialize, Deserialize};

use crate::{middleware, misc::{error::MapControllerError, response::Response}};

use super::{executor::execute, extractor};
use sar_blog::utils::json_datetime_format;


#[derive(Deserialize)]
struct QueryParams {
    depth: usize,
}

#[derive(Deserialize)]
struct CommentUpload {
    name: String,
    email: Option<String>,
    url: Option<String>,
    avatar: String,
    text: String,
}

#[derive(Serialize)]
struct PubComment {
    pid: PidType,
    comment_to: PidType,
    author: String,
    #[serde(with="json_datetime_format")]
    time: DateTime<chrono::Utc>,
    text: String,
}

impl From<Comment> for PubComment {
    fn from(comment: Comment) -> Self {
        Self {
            author: comment.author,
            comment_to: comment.comment_to,
            pid: comment.pid,
            text: comment.text,
            time: comment.time.into(),
        }
    }
}

#[get("/{pid}")]
async fn get_nested_comments(service: extractor::Service, Path(pid): Path<PidType>, Query(params): Query<QueryParams>) -> Response<Vec<NestedCommentRef>> {
    execute(async move {
        service.comment().get_comments_of_pid(pid, params.depth)
            .await
            .map_contoller_result()
    }).await
}

#[post("/{pid}")]
async fn post(service: extractor::Service, session: extractor::Session, Path(pid): Path<PidType>, data: Json<CommentUpload>) -> Response<PidType> {
    execute(async move {
        let author_info = AnonymousUserInfo {
            name: data.name.clone(),
            avatar: data.avatar.clone(),
            email: data.email.clone(),
            url: data.url.clone()
        };
        service.comment().post(pid, &data.text, session.id(), &author_info)
            .await
            .map_contoller_result()
    }).await
}

#[delete("/{pid}")]
async fn delete(service: extractor::Service, auth: extractor::Auth, Path(pid): Path<PidType>) -> Response<Option<PubComment>> {
    execute(async move {
        let comment = service.comment().delete(pid).await.map_contoller_result()?;
        Ok(comment.map(PubComment::from))
    }).await
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/comment")
                .service(get_nested_comments)
                .service(post)
    )
        .service(
            scope("/comment")
                .wrap(middleware::authentication())
                .service(delete)
    );
}