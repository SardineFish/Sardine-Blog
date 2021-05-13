use std::marker::PhantomData;

use serde::{Serialize, Deserialize};
use chrono::Utc;
use model::{Model, RankedScore};
use async_trait::async_trait;

#[allow(dead_code)]
mod snake_remake;
mod snake_web;

use crate::{Error, Service};

use self::{snake_web::SnakeWebRank};

pub use self::snake_remake::{SnakeRemakeRank, SnakeRemakeScore};

pub trait Score {
    fn name(&self) -> &str;
    fn validate(&self) -> Option<i64>;
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SimpleScore {
    name: String,
    score: i64,
}

impl SimpleScore {
    pub fn new(name: String, score: i64) -> Self {
        Self {
            name,
            score,
        }
    }
}

impl Score for SimpleScore {
    fn name(&self) -> &str {
        &self.name
    }
    fn validate(&self) -> Option<i64> {
        Some(self.score)
    }
}

pub trait RankProvider<Score> {
    fn rank_key() -> &'static str;
}

#[async_trait]
pub trait RankService<Score> {
    async fn get_ranked_scores(&self, skip: usize, count: usize) -> Result<Vec<RankedScore>, Error>;
    async fn post_score(&self, score: Score) -> Result<usize, Error>;
}

pub struct RankServiceWrapper<'s, T> {
    model: &'s Model,
    _phantom: PhantomData<T>,
}

impl<'s, T> RankServiceWrapper<'s, T> {
    fn new(service: &'s Service) -> Self {
        Self {
            model: &service.model,
            _phantom: PhantomData::default(),
        }
    }
}

#[async_trait]
impl<'s, Provider, ScoreT> RankService<ScoreT> for RankServiceWrapper<'s, Provider>
    where Provider: RankProvider<ScoreT> + Send + Sync,
        ScoreT: Score + Send + Sync + 'static,
{
    async fn get_ranked_scores(&self, skip: usize, count: usize) -> Result<Vec<RankedScore>, Error> {
        let scores = self.model.rank.get_ranked_score(Provider::rank_key(), skip, count).await?;
        Ok(scores)
    }

    async fn post_score(&self, score_data: ScoreT) -> Result<usize, Error> {
        let rank = match score_data.validate() {
            Some(score) => self.model.rank.add_ranked_score(Provider::rank_key(), score_data.name(), score, Utc::now()).await?,
            None => return Err(Error::InvalidScore)
        };
        Ok(rank)
    }
}


#[derive(Clone)]
pub struct RankServiceSelector<'a> {
    service: &'a Service,
}

impl<'a> RankServiceSelector<'a> {
    pub fn new (service: &'a Service) -> Self {
        Self {
            service,
        }
    }

    pub fn snake_web(self) -> RankServiceWrapper<'a, SnakeWebRank> {
        RankServiceWrapper::new(self.service)
    }

    pub fn snake_remake(self) -> RankServiceWrapper<'a, SnakeRemakeRank> {
        RankServiceWrapper::new(self.service)
    }
}