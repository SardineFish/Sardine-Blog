

use chrono::Utc;
use mongodb::{Collection, Database, bson::{self, doc}, options::{UpdateOptions}};
use serde::{Serialize};

use crate::error::*;

#[derive(Serialize)]
struct ObjectInfo {
    time: bson::DateTime,
    name: String,
}

pub struct StorageModel {
    collection: Collection
}

impl StorageModel {
    pub fn new(db: &Database) -> Self{
        Self {
            collection: db.collection("storage"),
        }
    }

    pub async fn name_existed(&self, name: &str) -> Result<bool> {
        let query = doc! {
            "name": name
        };
        let count = self.collection.count_documents(query, None).await?;
        Ok(count > 0)
    }
    
    pub async fn add_new_key(&self, name: &str) -> Result<bool> {
        let query = doc! {
            "name": name
        };
        let update = doc! {
            "$setOnInsert": bson::to_bson(&ObjectInfo {
                name: name.to_owned(),
                time: Utc::now().into(),
            })?
        };
        let mut opts = UpdateOptions::default();
        opts.upsert = Some(true);
        let result = self.collection.update_one(query, update, Some(opts))
            .await?;
        if let Some(_) = result.upserted_id {
            Ok(true)
        } else {
            Ok(false)
        }
    }

    pub async fn count(&self) -> Result<usize> {
        let count = self.collection.estimated_document_count(None).await?;
        Ok(count as usize)
    }
}