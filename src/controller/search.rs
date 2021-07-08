use actix_web::web::{ServiceConfig, scope};
use actix_web::{get, web::Query};
use sar_blog::model::SearchResult;
use crate::middleware;

use crate::misc::response::Response;

use super::extractor;

use Response::Ok;

#[derive(serde::Deserialize)]
struct SearchQuery {
    s: String,
    skip: usize,
    count: usize,
}

const THROTTLE: usize = 1;

#[get("", wrap = "middleware::throttle(THROTTLE)")]
async fn search(service: extractor::Service, query: Query<SearchQuery>) -> Response<SearchResult> {
    Ok(service.search().search(&query.s, query.skip, query.count)
        .await?)
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/search")
        .service(search)
    );
}