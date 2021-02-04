use crate::{PostType, model::{PidType}, post::Post, post_data::{PostStats}, user::User};
use chrono::{Utc};
use mongodb::{bson::doc};
use mongodb::{
    self,
    bson::{self, oid::ObjectId},
};
use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize, Clone, Copy)]
pub enum DocType {
    PlainText,
    HTML,
    Markdown,
}

#[derive(Serialize, Deserialize, Clone)]
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

#[derive(Serialize, Clone)]
pub struct BlogContent {
    pub title: String,
    pub tags: Vec<String>,
    pub time: bson::DateTime,
    pub doc_type: DocType,
    pub doc: String,
}

impl Blog {
    pub fn new(pid: PidType, author: &User, content: BlogContent) -> Self {
        Self {
            pid,
            time: Utc::now().into(),
            author: author.info.name.clone(),
            uid: author.uid.clone(),
            title: content.title,
            tags: content.tags,
            doc_type: content.doc_type,
            doc: content.doc,
            _id: Default::default(),
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
    fn author(&self) -> &str {
        &self.author
    }
    fn time(&self) -> chrono::DateTime<Utc> {
        self.time.into()
    }
    fn post_type(&self) -> PostType {
        PostType::Blog(self._id.clone())
    }
}