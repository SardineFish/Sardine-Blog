use actix_web::{HttpRequest, delete, get, post, web::{scope, Json, Path, Query, ServiceConfig}};
use chrono::DateTime;
use sar_blog::{Author, NestedCommentRef, model::{AnonymousUserInfo, Comment, CommentContent, PidType, PubUserInfo}};
use serde::{Deserialize, Serialize};

use crate::{error::Error, middleware, misc::{error::MapControllerError, response::Response, utils::EmptyAsNone}};

use super::{executor::execute, extractor};
use sar_blog::utils::json_datetime_format;

#[derive(Deserialize)]
struct QueryParams {
    #[serde(default = "default_depth")]
    depth: usize,
}
fn default_depth() -> usize {
    7
}

#[derive(Deserialize)]
struct CommentUpload {
    name: Option<String>,
    email: Option<String>,
    url: Option<String>,
    avatar: Option<String>,
    text: String,
}

#[derive(Serialize)]
struct PubComment {
    pid: PidType,
    comment_to: PidType,
    author: PubUserInfo,
    #[serde(with = "json_datetime_format")]
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
async fn get_nested_comments(
    service: extractor::Service,
    Path(pid): Path<PidType>,
    Query(params): Query<QueryParams>,
) -> Response<Vec<NestedCommentRef>> {
    execute(async move {
        service
            .comment()
            .get_comments_of_pid(pid, params.depth)
            .await
            .map_contoller_result()
    })
    .await
}

#[post("/{pid}")]
async fn post(
    service: extractor::Service,
    Path(pid): Path<PidType>,
    data: Json<CommentUpload>,
    request: HttpRequest,
) -> Response<PidType> {
    execute(async move {
        let auth = middleware::auth_from_request(&service, &request)
            .await?;
        let author = match auth {
            Some(auth) => Author::Authorized(auth),
            None => Author::Anonymous(AnonymousUserInfo {
                name: data.name.as_ref()
                    .empty_as_none()
                    .ok_or(Error::invalid_params("Missing 'name'"))?
                    .clone(),
                avatar: data.avatar.as_ref()
                    .empty_as_none()
                    .ok_or(Error::invalid_params("Missing 'avatar'"))?
                    .clone(),
                email: data.email.clone().empty_as_none(),
                url: data.url.clone().empty_as_none(),
            })
        };

        service
            .comment()
            .post(pid, &data.text, author)
            .await
            .map_contoller_result()
    })
    .await
}

#[delete("/{pid}", wrap = "middleware::authentication()")]
async fn delete(
    service: extractor::Service,
    auth: extractor::Auth,
    Path(pid): Path<PidType>,
) -> Response<Option<CommentContent>> {
    execute(async move {
        let comment = service.comment().delete(&auth.uid, pid).await.map_contoller_result()?;
        Ok(comment)
    })
    .await
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/comment")
            .service(get_nested_comments)
            .service(post)
            .service(delete),
    );
}
