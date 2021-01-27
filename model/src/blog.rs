use chrono::{DateTime, Utc};
use mongodb::{self, Collection, Database, bson::oid::ObjectId};
use crate::model::PidType;

use super::error::*;

const COLLECTION_BLOG: &str = "blog";

pub enum DocType {
    PlainText,
    HTML,
    Markdown,
}

pub struct Blog {
    pub(crate) _id: ObjectId,
    pub pid: PidType,
    pub title: String,
    pub tags: Vec<String>,
    pub time: DateTime<Utc>,
    pub author: String,
    pub doc: String,
}

pub struct BlogModel {
    collection: Collection
}

impl BlogModel {
    pub fn new(db: &Database) -> Self {
        Self{
            collection: db.collection(COLLECTION_BLOG)
        }
    }

    pub asyc fn get_by_pid(&self, pid: u32) -> Result<> {

    }
}
