use chrono::{DateTime, Utc};
use futures::future::ready;
use mongodb::{Collection, Database, bson::doc, options::FindOptions};
use mongodb::bson::{self, Document};
use futures_util::{StreamExt};
use serde::{Deserialize};
use shared::error::LogError;

use crate::Error;

#[derive(Deserialize)]
pub struct RankedScore {
    pub name: String,
    pub score: i64,
    pub time: bson::DateTime,
}

#[derive(Clone)]
pub struct RankModel {
    pub collection: Collection<RankedScore>,
}

impl RankModel {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection("rank"),
        }
    }

    pub async fn init_collection(&self, db: &Database) {
        db.run_command(doc! {
            "createIndexes": "rank",
            "indexes": [
                {
                    "key": {
                        "score": -1,
                    },
                    "name": "idx_score",
                },
                {
                    "key": {
                        "key": 1,
                    },
                    "name": "idx_key",
                },
            ],
        }, None).await.log_warn_consume("init-db-rank");
    }

    pub async fn get_ranked_score(&self, key: &str, skip: usize, count: usize) -> Result<Vec<RankedScore>, Error> {
        let query = doc! {
            "key": key,
        };
        let opts = FindOptions::builder()
            .sort(Some(doc!{"score": -1i32, "time": -1i32}))
            .skip(Some(skip as u64))
            .limit(Some(count as i64))
            .build();
        let scores: Vec<RankedScore> = self.collection.find(query, opts)
            .await?
            .filter_map(|result| ready(result.ok()))
            .collect()
            .await;
        Ok(scores)
    }

    pub async fn add_ranked_score(&self, key: &str, name: &str, score: i64, time: DateTime<Utc>) -> Result<usize, Error> {
        let insert = doc! {
            "key": key,
            "name": name,
            "score": score,
            "time": bson::to_bson(&bson::DateTime::from(time))?,
        };
        let query = doc! {
            "key": key,
            "score": {"$gt": score}
        };
        self.collection.clone_with_type::<Document>().insert_one(insert, None).await?;
        let count = self.collection.count_documents(query, None).await?;
        Ok(count as usize)
    }
}