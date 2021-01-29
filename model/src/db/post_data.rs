use mongodb::{Collection, Database, bson::{self, DateTime, doc, oid::ObjectId}};
use serde::{Serialize, Deserialize};

use crate::{Post, model::PidType};
use crate::error::*;

use super::post;

const COLLECTION_POST_DATA: &str = "post_data";

#[derive(Serialize, Deserialize)]
pub enum PostType{
    Blog(ObjectId),
    Note(ObjectId),
    Comment(ObjectId, PidType),
}

#[derive(Serialize, Deserialize, Default, Clone)]
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
    pub post: PostType,
}

impl<T> From<T> for PostData where T : Post {
    fn from(post: T) -> Self {
        Self {
            _id: ObjectId::new(),
            pid: post.pid(),
            author: post.author().to_string(),
            time: post.time().into(),
            post: post.post_type(),
        }
    }
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

    pub async fn add_post<T: Post>(&self, post: T) -> Result<()> {
        let post_data = PostData::from(post);
        self.collection.insert_one(bson::to_document(&post_data).map_model_result()?, None)
            .await
            .map_model_result()?;
        Ok(())
    }

    pub async fn get_by_pid(&self, pid: PidType) -> Result<PostData> {
        let query = doc!{
            "_id": pid
        };
        let doc = self.collection.find_one(query, None)
            .await
            .map_model_result()?
            .ok_or(Error::PostNotFound(pid))?;
        
        bson::from_document(doc).map_model_result()
    }
}