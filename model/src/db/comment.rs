use std::collections::HashMap;

use bson::de;
use chrono::Utc;
use mongodb::{Collection, Database, bson::{self, DateTime, doc, oid::ObjectId}, options::FindOneAndUpdateOptions};
use serde::{Serialize, Deserialize};

use crate::{model::PidType, user::User};
use crate::error::*;

const COLLECTION_COMMENT: &str = "comment";

#[derive(Serialize, Deserialize)]
pub struct Comment {
    pub(crate) _id: ObjectId,
    pub pid: PidType,
    pub comment_to: PidType,
    pub author: String,
    pub uid: String,
    pub time: DateTime,
    pub text: String,
    pub notify: bool,
}

impl Comment {
    pub fn new(pid: PidType, comment_to: PidType, author: &User) -> Self {
        Self {
            pid,
            comment_to,
            author: author.info.name.clone(),
            uid: author.uid.clone(),
            time: Utc::now().into(),
            notify: false,
            _id: Default::default(),
            text: Default::default(),
        }
    }
}

#[derive(Serialize, Deserialize)]
struct CommentCollection {
    pub _id: ObjectId,
    pub pid: PidType,
    pub comments: HashMap<PidType, Comment>,
}

impl CommentCollection {
    pub fn new(pid: PidType) -> Self {
        Self {
            _id: ObjectId::new(),
            pid,
            comments: Default::default(),
        }
    }
}

pub struct CommentModel {
    collection: Collection,
}

impl CommentModel {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection(COLLECTION_COMMENT)
        }
    }

    pub async fn get(&self, pid: PidType) -> Result<HashMap<PidType, Comment>> {
        let query = doc! {
            "pid": pid,
        };
        let result = self.collection.find_one(query, None)
            .await
            .map_model_result()?
            .ok_or(Error::PostNotFound(pid))?;

        let comment_collection: CommentCollection = bson::from_document(result)
            .map_model_result()?;
        
        Ok(comment_collection.comments)
            
    }

    pub async fn init_comment(&self, pid: PidType) -> Result<()> {
        let collection = CommentCollection::new(pid);

        self.collection.insert_one(bson::to_document(&collection).unwrap(), None)
            .await
            .map_model_result()?;

        Ok(())
    }

    pub async fn post(&self, root_pid: PidType, comment: Comment) -> Result<Comment> {
        let query = doc!{
            "pid": root_pid,
        };
        let update = doc!{
            "$set": {
                format!("comment.{}", comment.pid) : bson::to_bson(&comment).unwrap()
            }
        };
        self.collection.update_one(query, update, None)
            .await
            .map_model_result()?;

        Ok(comment)
    }

    pub async fn delete(&self, root_pid: PidType, pid: PidType) -> Result<Option<Comment>> {
        let query = doc!{
            "pid": root_pid,
        };
        let update = doc! {
            "$unset": {
                format!("comment.{}", pid): "",
            }
        };
        let mut options = FindOneAndUpdateOptions::default();
        options.return_document = Some(mongodb::options::ReturnDocument::Before);
        let result = self.collection.find_one_and_update(query, update, options)
            .await
            .map_model_result()?
            .ok_or(Error::PostNotFound(root_pid))?;
        
        let mut comment_collection: CommentCollection = bson::from_document(result).map_model_result()?;
        Ok(comment_collection.comments.remove(&pid))
    }
}