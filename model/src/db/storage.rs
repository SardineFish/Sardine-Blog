

use chrono::Utc;
use mongodb::{Collection, Database, bson::{self, doc}, error::{ErrorKind}};
use serde::{Serialize};
use shared::error::LogError;

use crate::error::*;

#[derive(Serialize)]
struct ObjectInfo {
    time: bson::DateTime,
    name: String,
}

pub struct StorageModel {
    collection: Collection<ObjectInfo>
}

impl StorageModel {
    pub fn new(db: &Database) -> Self{
        Self {
            collection: db.collection("storage"),
        }
    }

    pub async fn init_collection(db: &Database) {
        db.run_command(doc! {
            "createIndexes": "storage",
            "indexes": [
                {
                    "key": {
                        "name": 1,
                    },
                    "name": "idx_name",
                },
            ],
        }, None).await.log_warn_consume("init-db");
    }

    pub async fn name_existed(&self, name: &str) -> Result<bool> {
        let query = doc! {
            "name": name
        };
        let count = self.collection.count_documents(query, None).await?;
        Ok(count > 0)
    }
    
    pub async fn add_new_key(&self, name: &str) -> Result<bool> {
        match self.collection.insert_one(&ObjectInfo {
            name: name.to_owned(),
            time: Utc::now().into()
        }, None).await {
            Ok(_) => Ok(true),
            Err(err) => match err.kind.as_ref() {
                ErrorKind::Command(cmd_err) if cmd_err.code == 11000 => Ok(false),
                _ => Err(err)?
            }
        }
    }

    pub async fn count(&self) -> Result<usize> {
        let count = self.collection.estimated_document_count(None).await?;
        Ok(count as usize)
    }
}