use crate::{ model::{PidType}, PostStats};
use mongodb::{bson::doc};
use mongodb::{
    self,
    bson::{self},
};
use serde::{Deserialize, Serialize};

use super::{ user::PubUserInfo};

#[derive(Serialize, Deserialize, Clone, Copy)]
pub enum DocType {
    PlainText,
    HTML,
    Markdown,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BlogContent {
    pub title: String,
    pub tags: Vec<String>,
    pub doc_type: DocType,
    pub doc: String,
}


#[derive(Deserialize, Clone)]
pub struct Blog {
    pub title: String,
    pub tags: Vec<String>,
    pub doc_type: DocType,
    pub doc: String,

    pub pid: PidType,
    pub uid: String,
    pub time: bson::DateTime,
    pub stats: PostStats,
    pub author: PubUserInfo,
}


impl Blog {
}