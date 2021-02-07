use chrono::Utc;
use mongodb::{ bson::{DateTime, oid::ObjectId}};
use serde::{Serialize, Deserialize};

use crate::error::*;
use crate::{PostType, User, blog::DocType, model::PidType, post_data::{PostStats, Post}};

use super::{post_data::PostContent, user::PubUserInfo};

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

// impl Note {
//     pub fn new(pid: PidType, author: &User, doc_type: DocType, content: &str) -> Self {
//         Self {
//             pid,
//             uid: author.uid.clone(),
//             doc_type,
//             doc: content.to_string(),
//             time: Utc::now().into(),
//             stats: Default::default(),
//             _id: Default::default(),
//             author: PubUserInfo::from(author),
//         }
//     }
// }

// impl Post for Note {
//     fn pid(&self) -> PidType {
//         self.pid
//     }
//     fn stats(&self) -> &PostStats {
//         &self.stats
//     }
//     fn author(&self) -> &PubUserInfo {
//         &self.author
//     }
//     fn time(&self) -> chrono::DateTime<Utc> {
//         self.time.into()
//     }
//     fn post_type(&self) -> PostType {
//         PostType::Note
//     }
// }
