use crate::middleware;
use actix_web::web::{scope, ServiceConfig};
use actix_web::{get, web::Query};
use sar_blog::cache_namespaces;
use sar_blog::model::SearchResult;

use crate::misc::response::Response;

use super::extractor;

use Response::Ok;

#[derive(Clone, serde::Deserialize, serde::Serialize)]
struct SearchQuery {
    q: String,
    skip: usize,
    count: usize,
}

const THROTTLE: usize = 1;

#[get("", wrap = "middleware::throttle(THROTTLE)")]
async fn search(
    service: extractor::Service,
    Query(query): Query<SearchQuery>,
) -> Response<SearchResult> {
    if let Result::Ok(query_str) = serde_urlencoded::to_string(&query) {
        let mut cache = service
            .cache()
            .json::<SearchResult>(cache_namespaces::SEAERCH, &query_str)
            .await;

        if let Some(cached_result) = cache.get().await {
            log::info!("Cache hit for searching {query_str}");
            return Ok(cached_result);
        } else {
            log::info!("Cache miss for searching {query_str}");
            let result = service
                .search()
                .search(&query.q, query.skip, query.count)
                .await?;
            cache.set(&result).await;
            return Ok(result);
        }
    }
    Ok(service
        .search()
        .search(&query.q, query.skip, query.count)
        .await?)
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/search").service(search));
}
