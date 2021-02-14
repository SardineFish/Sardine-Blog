use actix_web::{delete, get, post, web::{Json, Path, ServiceConfig, scope}};
use sar_blog::model::{Access, MiscellaneousPostContent, PidType, PostStats};

use crate::misc::{error::MapControllerError, response::Response};
use crate::middleware;

use super::{executor::execute, extractor};

#[get("/{pid}/stats")]
async fn get_stats(service: extractor::Service, session: extractor::Session, Path(pid): Path<PidType>) -> Response<PostStats> {
    execute(async move {
        let stats = service.post_data().get_stats_by_pid(pid, session.id())
            .await
            .map_contoller_result()?;
        Ok(stats)
    }).await
}

#[post("/{pid}/like")]
async fn like(service: extractor::Service, session: extractor::Session, Path(pid): Path<PidType>) -> Response<usize> {
    execute(async move {
        service.post_data().like(pid, session.id())
            .await
            .map_contoller_result()
    }).await
}

#[delete("/{pid}/like")]
async fn dislike(service: extractor::Service, session: extractor::Session, Path(pid): Path<PidType>) -> Response<usize> {
    execute(async move {
        service.post_data().dislike(pid, session.id())
            .await
            .map_contoller_result()
    }).await
}

#[post("/misc_post", wrap = "middleware::authentication(Access::Trusted)")]
async fn post_miscellaneous(service: extractor::Service, auth: extractor::Auth, data: Json<MiscellaneousPostContent>) -> Response<PidType> {
    execute(async move {
        service.post_data().post_miscellaneous(&auth.uid, data.to_owned())
            .await
            .map_contoller_result()
    }).await
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/post")
        .service(get_stats)
        .service(like)
        .service(dislike)
        .service(post_miscellaneous)
    );
}