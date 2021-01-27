use mongodb::{ bson::{DateTime, oid::ObjectId}};
use serde::{Serialize, Deserialize};

use crate::{blog::DocType, model::PidType, post::Post, post_data::PostStats};

#[derive(Serialize, Deserialize)]
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
}
