use actix_web::{
    delete, get, post,
    web::{scope, Json, Path, Query, ServiceConfig},
};
use sar_blog::{
    model::{Access, MiscellaneousPostContent, PidType, PostStats},
    RecentActivity,
};

use crate::middleware;
use crate::misc::{error::MapControllerError, response::Response};

use super::extractor;

use Response::Ok;

#[get("/{pid}/stats")]
async fn get_stats(
    service: extractor::Service,
    session: extractor::Session,
    pid: Path<PidType>,
) -> Response<PostStats> {
    let stats = service
        .post_data()
        .get_stats_by_pid(pid.into_inner(), session.id())
        .await
        .map_contoller_result()?;
    Ok(stats)
}

#[post("/{pid}/like")]
async fn like(
    service: extractor::Service,
    session: extractor::Session,
    pid: Path<PidType>,
) -> Response<usize> {
    service
        .post_data()
        .like(pid.into_inner(), session.id())
        .await
        .map_contoller_result()
        .into()
}

#[delete("/{pid}/like")]
async fn dislike(
    service: extractor::Service,
    session: extractor::Session,
    pid: Path<PidType>,
) -> Response<usize> {
    service
        .post_data()
        .dislike(pid.into_inner(), session.id())
        .await
        .map_contoller_result()
        .into()
}

#[post("/misc_post", wrap = "middleware::authentication(Access::Trusted)")]
async fn post_miscellaneous(
    service: extractor::Service,
    auth: extractor::Auth,
    data: Json<MiscellaneousPostContent>,
) -> Response<PidType> {
    service
        .post_data()
        .post_miscellaneous(&auth.uid, data.to_owned())
        .await
        .map_contoller_result()
        .into()
}

#[derive(serde::Deserialize)]
struct QueryParams {
    skip: usize,
    count: usize,
}

#[get("/recently")]
async fn get_recent_activities(
    service: extractor::Service,
    query: Query<QueryParams>,
) -> Response<Vec<RecentActivity>> {
    service
        .post_data()
        .get_post_activities(query.skip, query.count)
        .await
        .map_contoller_result()
        .into()
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/post")
            .service(get_stats)
            .service(like)
            .service(dislike)
            .service(post_miscellaneous)
            .service(get_recent_activities),
    );
}
