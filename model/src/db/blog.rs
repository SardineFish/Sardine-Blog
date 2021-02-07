use crate::{ model::{PidType}, post_data::{PostStats}};
use mongodb::{bson::doc};
use mongodb::{
    self,
    bson::{self, oid::ObjectId},
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
    // pub fn new(pid: PidType, author: &User, content: &BlogContent) -> Self {
    //     Self {
    //         pid,
    //         time: Utc::now().into(),
    //         author: PubUserInfo::from(author),
    //         uid: author.uid.clone(),
    //         title: content.title.clone(),
    //         tags: content.tags.clone(),
    //         doc_type: content.doc_type,
    //         doc: content.doc.clone(),
    //         _id: Default::default(),
    //         stats: Default::default(),
    //     }
    // }

    // pub fn update_content(&mut self, author: &User, content: &BlogContent) {
    //     self.time = Utc::now().into();
    //     self.author = author.info.name.clone();
    //     self.uid = author.uid.clone();
    //     self.title = content.title.clone();
    //     self.tags = content.tags.clone();
    //     self.doc_type = content.doc_type;
    //     self.doc = content.doc.clone();

    // }
}

// impl Post for Blog {
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
//         PostType::Blog
//     }
// }