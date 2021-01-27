use crate::{model::{PidType}, post::Post, post_data::{PostStats}, user::User};
use chrono::{Utc};
use mongodb::{bson::doc};
use mongodb::{
    self,
    bson::{self, oid::ObjectId},
};
use serde::{Deserialize, Serialize};


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
    pub uid: String,
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
    pub fn new(pid: PidType, author: &User) -> Self {
        Self {
            pid,
            time: Utc::now().into(),
            author: author.info.name.clone(),
            uid: author.uid.clone(),
            _id: Default::default(),
            title: Default::default(),
            tags: Default::default(),
            doc_type: DocType::PlainText,
            doc: Default::default(),
            stats: Default::default(),
        }
    }
}

impl Post for Blog {
    fn pid(&self) -> PidType {
        self.pid
    }
    fn stats(&self) -> &PostStats {
        &self.stats
    }
}