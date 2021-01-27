use mongodb::{Collection, Database, bson::{self, DateTime, doc, oid::ObjectId}};
use serde::{Serialize, Deserialize};

use crate::{ model::PidType};
use crate::error::*;

const COLLECTION_POST_DATA: &str = "post_data";

#[derive(Serialize, Deserialize)]
pub enum Post{
    Blog(ObjectId),
    Note(ObjectId),
    Comment(ObjectId),
}

#[derive(Serialize, Deserialize, Default)]
pub struct PostStats {
    pub likes: usize,
    pub views: usize,
    pub comments: usize,
}

#[derive(Serialize, Deserialize)]
pub struct PostData {
    pub _id: ObjectId,
    pub pid: PidType,
    pub author: String,
    pub time: DateTime,
    pub post: Post,
}

#[derive(Serialize, Deserialize)]
struct PostMetaData {
    pub _id: ObjectId,
    pub posts: PidType,
}

pub struct PostDataModel {
    collection: Collection,
    meta_id: ObjectId,
}


impl PostDataModel {
    pub fn new(db: &Database) -> Self{
        Self{
            collection: db.collection(COLLECTION_POST_DATA),
            meta_id: ObjectId::with_bytes([0;12]),
        }
    }
    pub async fn init_meta(&self) -> Result<()> {
        let data = PostMetaData {
            _id: self.meta_id.clone(),
            posts: 0,
        };

        self.collection.insert_one(bson::to_document(&data).unwrap(), None)
            .await
            .map_model_result()?;

        Ok(())
    }
    
    pub async fn new_pid(&self) -> Result<PidType> {
        let query = doc! {
            "_id": &self.meta_id,
        };
        let update = doc!{
            "$inc": {
                "posts": 1
            }
        };

        let result = self.collection.find_one_and_update(query, update, None)
            .await
            .map_model_result()?
            .expect("Missing Metadata");

        let metadata: PostMetaData = bson::from_document(result).expect("Failed to deserialize metadata.");
        Ok(metadata.posts)
    }
}