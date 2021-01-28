use std::usize;

use bson::{Document, doc};
use mongodb::{Collection, Database, bson, options::{FindOneAndUpdateOptions, FindOptions}};
use serde::{Serialize, de::DeserializeOwned};
use tokio::stream::StreamExt;

use crate::{error::*, model::PidType, post_data::PostStats};

const COLLECTION_POST: &str = "post";

pub trait Post {
    fn pid(&self) -> PidType;
    fn stats(&self) -> &PostStats;
}

pub struct PostModel {
    collection: Collection,
    update_options: FindOneAndUpdateOptions,
}

fn query(pid: PidType) -> Document {
    doc! {
        "pid": pid
    }
}

impl PostModel {
    pub fn new(db: &Database) -> Self {
        let mut opts = FindOneAndUpdateOptions::default();
        opts.return_document = Some(mongodb::options::ReturnDocument::After);

        Self {
            collection: db.collection(COLLECTION_POST),
            update_options: opts,
        }
    }

    pub async fn get_list<T: Post + DeserializeOwned>(&self, from: usize, count: usize) -> Result<Vec<T>> {
        let mut opts = FindOptions::default();
        opts.skip = Some(from as i64);
        opts.limit = Some(count as i64);

        let result = self.collection.find(None, opts)
            .await
            .map_model_result()?;
        
        let posts: Vec<T> = result.filter_map(
            |t| t.ok().and_then(
                |doc| bson::from_document(doc).ok()))
            .collect()
            .await;

        Ok(posts)
    }

    pub async fn get_by_pid<T: Post + DeserializeOwned>(&self, pid: PidType) -> Result<T> {
        let doc = self.collection.find_one(query(pid), None)
            .await
            .map_model_result()?
            .ok_or(Error::PostNotFound(pid))?;

        bson::from_document(doc).map_model_result()
    }

    pub async fn post<T: Post + Serialize>(&self, post: &T) -> Result<()> {
        let doc = bson::to_document(post).map_model_result()?;
        self.collection.insert_one(doc, None)
            .await
            .map_model_result()?;
        Ok(())
    }

    pub async fn update<T: Serialize, P: Post + DeserializeOwned>(&self, pid: PidType, data: &T) -> Result<P> {
        let update = doc! {
            "$set": bson::to_bson(data).map_model_result()?
        };
        let doc = self.collection.find_one_and_update(query(pid), update, self.update_options.clone())
            .await
            .map_model_result()?
            .ok_or(Error::PostNotFound(pid))?;

        bson::from_document(doc).map_model_result()
    }

    pub async fn delete<P: Post + DeserializeOwned>(&self, pid: PidType) -> Result<Option<P>> {
        let doc = self.collection.find_one_and_delete(query(pid), None)
            .await
            .map_model_result()?;
        if let Some(doc) = doc {
            Ok(Some(bson::from_document(doc).map_model_result()?))
        } else {
            Ok(None)
        }
    }

    pub async fn like<T: Post + DeserializeOwned>(&self, pid: PidType) -> Result<usize> {   
        let post: T = self.increase_stats(pid, "likes").await?;
        Ok(post.stats().likes)
    }

    pub async fn view<T: Post + DeserializeOwned>(&self, pid: PidType) -> Result<usize> {
        let post : T = self.increase_stats(pid, "views").await?;
        Ok(post.stats().views)
    }

    pub async fn add_comment<T: Post + DeserializeOwned>(&self, pid: PidType) -> Result<usize> {
        let post : T = self.increase_stats(pid, "comments").await?;
        Ok(post.stats().comments)
    }

    async fn increase_stats<T: Post + DeserializeOwned>(&self, pid: PidType, key: &str) -> Result<T> {
        let update = doc! {
            "$inc": {
                format!("stats.{}", key): 1
            }
        };
        let doc = self.collection.find_one_and_update(query(pid), update, self.update_options.clone())
            .await
            .map_model_result()?
            .ok_or(Error::PostNotFound(pid))?;
        
        bson::from_document(doc).map_model_result()
    }
}