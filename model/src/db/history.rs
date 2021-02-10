use chrono::{DateTime, Utc};
use mongodb::{Collection, Database, bson};
use serde::{Serialize, Deserialize};

use crate::{ PostType, user::User};
use crate::error::*;

const COLLECTION_HISTORY: &str = "history";

#[derive(Serialize, Deserialize)]
pub enum HistoryData {
    Post(PostType),
    User(User),
}
#[derive(Serialize, Deserialize, Debug)]
pub enum Operation {
    Create,
    Update,
    Delete,
    Snapshot,
}

#[derive(Serialize, Deserialize)]
pub struct History {
    pub op: Operation,
    pub time: bson::DateTime,
    pub user: String,
    pub data: HistoryData,
}

impl History {
    fn new(user: String, op: Operation, data: HistoryData) -> Self{
        Self {
            op,
            user,
            data,
            time: Utc::now().into(),
        }
    }
}

#[derive(Clone)]
pub struct HistoryModel {
    collection: Collection,
}

impl HistoryModel {
    pub fn new(db: &Database) -> Self {
        Self{
            collection: db.collection(COLLECTION_HISTORY)
        }
    }

    pub async fn record(&self, uid: &str, op: Operation, data: HistoryData) -> Result<()> {
        let history = History::new(uid.to_string(), op, data);
        self.collection.insert_one(bson::to_document(&history).unwrap(), None)
            .await
            .map_model_result()?;
        Ok(())
    }

    pub async fn record_with_time(&self, uid: &str, op: Operation, data: HistoryData, time: DateTime<Utc>) -> Result<()> {
        let mut history = History::new(uid.to_string(), op, data);
        history.time = time.into();
        self.collection.insert_one(bson::to_document(&history).unwrap(), None)
            .await
            .map_model_result()?;
        Ok(())
    }
}