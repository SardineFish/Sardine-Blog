use mongodb::{ bson::{DateTime}};
use serde::{Serialize, Deserialize};

use crate::{ blog::DocType, model::PidType, PostStats};

use super::{ user::PubUserInfo};

#[derive(Serialize, Deserialize, Clone)]
pub struct NoteContent {
    pub doc_type: DocType,
    pub doc: String,
}

#[derive(Deserialize, Clone)]
pub struct Note {
    pub doc_type: DocType,
    pub doc: String,

    pub pid: PidType,
    pub uid: String,
    pub time: DateTime,
    pub stats: PostStats,
    pub author: PubUserInfo,
}
