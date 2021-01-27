use crate::{model::{Model, PidType}, post_data::{PostDataModel, PostStats}};
use chrono::{DateTime, Utc};
use mongodb::{bson::doc, options::FindOneAndUpdateOptions};
use mongodb::{
    self,
    bson::{self, oid::ObjectId},
    options::FindOptions,
    Collection, Database,
};
use serde::{Deserialize, Serialize, __private::doc};
use tokio::stream::StreamExt;

use super::error::*;

const COLLECTION_BLOG: &str = "blog";

#[derive(Serialize, Deserialize)]
pub enum DocType {
    PlainText,
    HTML,
    Markdown,
}

#[derive(Serialize, Deserialize)]
pub struct Blog {
    pub(crate) _id: ObjectId,
    pub pid: PidType,
    pub title: String,
    pub tags: Vec<String>,
    pub time: bson::DateTime,
    pub doc_type: DocType,
    pub author: String,
    pub doc: String,
    pub stats: PostStats,
}

#[derive(Serialize)]
pub struct BlogContent {
    pub title: String,
    pub tags: Vec<String>,
    pub time: bson::DateTime,
    pub doc_type: DocType,
    pub doc: String,
}

impl Blog {
    pub fn new(pid: PidType, author: &str) -> Self {
        Self {
            pid,
            time: Utc::now().into(),
            author: author.to_string(),
            _id: Default::default(),
            title: Default::default(),
            tags: Default::default(),
            doc_type: DocType::PlainText,
            doc: Default::default(),
            stats: Default::default(),
        }
    }
}

pub struct BlogModel {
    collection: Collection,
}

impl BlogModel {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection(COLLECTION_BLOG),
        }
    }

    pub async fn get_list(&self, from: usize, count: usize) -> Result<Vec<Blog>> {
        let mut options = FindOptions::default();
        options.skip = Some(from as i64);
        options.limit = Some(count as i64);
        let result = self
            .collection
            .find(None, Some(options))
            .await
            .map_model_result()?;

        let blogs: Vec<Blog> = result
            .filter_map(|t| t.ok().and_then(|doc| bson::from_document::<Blog>(doc).ok()))
            .collect()
            .await;

        Ok(blogs)
    }

    pub async fn get_by_pid(&self, pid: PidType) -> Result<Vec<Blog>> {
        let query = doc! {
            "pid": pid,
        };
        let doc = self.collection.find_one(query, None)
            .await
            .map_model_result()?
            .ok_or(Error::DataNotFound(pid))?;
        let blog = bson::from_document(doc).map_model_result()?;

        Ok(blog)
    }

    pub async fn post(&self, blog: Blog) -> Result<Blog> {

        self.collection.insert_one(bson::to_document(&blog).unwrap(), None)
            .await
            .map_model_result()?;

        Ok(blog)
    }

    pub async fn update(&self, pid: PidType, blog: BlogContent) -> Result<Blog> {
        
        let query = doc! {
            "pid": pid,
        };
        let update = doc! {
            "$set": bson::to_bson(&blog).unwrap(),
        };
        let mut options = FindOneAndUpdateOptions::default();
        options.return_document = Some(mongodb::options::ReturnDocument::After);

        let result = self.collection.find_one_and_update(query, update, options)
            .await
            .map_model_result()?
            .ok_or(Error::DataNotFound(pid))?;

        bson::from_document(result).map_model_result()
    }

    pub async fn delete(&self, pid: PidType) -> Result<Option<Blog>> {
        let query = doc! {
            "pid": pid,
        };

        let result = self.collection.find_one_and_delete(query, None)
            .await
            .map_model_result()?;
        
        if let Some(doc) = result {
            Ok(Some(bson::from_document(doc).map_model_result()?))
        } else {
            Ok(None)
        }
    }
}
