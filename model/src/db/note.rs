use chrono::Utc;
use mongodb::{ bson::{DateTime, oid::ObjectId}};
use serde::{Serialize, Deserialize};

use crate::{PostType, User, blog::DocType, model::PidType, post::Post, post_data::PostStats};

#[derive(Serialize, Deserialize, Clone)]
pub struct Note {
    pub(crate) _id: ObjectId,
    pub pid: PidType,
    pub uid: String,
    pub author: String,
    pub time: DateTime,
    pub doc_type: DocType,
    pub doc: String,
    pub stats: PostStats,
}

impl Note {
    pub fn new(pid: PidType, author: &User, doc_type: DocType, content: &str) -> Self {
        Self {
            pid,
            author: author.info.name.clone(),
            uid: author.uid.clone(),
            doc_type,
            doc: content.to_string(),
            time: Utc::now().into(),
            stats: Default::default(),
            _id: Default::default(),
        }
    }
}

impl Post for Note {
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
