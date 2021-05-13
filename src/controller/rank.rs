use actix_http::http::StatusCode;
use actix_web::{get, post, web::{Json, Path, Query, ServiceConfig, scope}};
use sar_blog::{SimpleScore, SnakeRemakeScore, model::{RankedScore}};
use sar_blog::RankService;
use serde::{Serialize, Deserialize};

use crate::misc::{response::Response};
use crate::misc::error::*;

use super::extractor;

use Response::Ok;

#[derive(Serialize)]
struct Score {
    name: String,
    score: i64,
    time: i64,
}

impl From<RankedScore> for Score {
    fn from(score: RankedScore) -> Self {
        Self {
            name: score.name,
            score: score.score,
            time: score.time.timestamp_millis(),
        }
    }
}

fn default_skip() -> usize {
    0
}
fn default_count() -> usize {
    10
}

#[derive(Deserialize)]
struct QueryParams {
    #[serde(default = "default_skip")]
    skip: usize,
    #[serde(default = "default_count")]
    count: usize,
}

#[get("/{key}")]
async fn get_score(service: extractor::Service, key: Path<String>, query: Query<QueryParams>) -> Response<Vec<Score>> {
    let scores = match key.as_str() {
        "snakeWeb" => service.rank().snake_web().get_ranked_scores(query.skip, query.count).await?,
        "snake-remake" => service.rank().snake_remake().get_ranked_scores(query.skip, query.count).await?,
        _ => Err(Error::Misc(StatusCode::NOT_FOUND, "Not supported"))?,
    };
    Ok(scores.into_iter().map(Score::from).collect())
}

#[post("/snakeWeb")]
async fn post_snake_web(service: extractor::Service, data: Json<SimpleScore>) -> Response<usize> {
    let rank = service.rank().snake_web().post_score(data.into_inner()).await?;
    Ok(rank)
}

#[post("/snake-remake")]
async fn post_snake_remake(service: extractor::Service, data: Json<SnakeRemakeScore>) -> Response<usize> {
    let rank = service.rank().snake_remake().post_score(data.into_inner()).await?;
    Ok(rank)
}


pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/rank")
        .service(get_score)
        .service(post_snake_remake)
        .service(post_snake_web)
    );
}