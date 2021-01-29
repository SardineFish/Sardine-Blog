use chrono::Utc;
use mongodb::{ bson::{DateTime, oid::ObjectId}};
use serde::{Serialize, Deserialize};

use crate::{PostType, blog::DocType, model::PidType, post::Post, post_data::PostStats};

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
