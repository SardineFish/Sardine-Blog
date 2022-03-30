use crate::{ model::{PidType}, PostStats, PostData, PostType};
use mongodb::{bson::doc};
use mongodb::{
    self,
    bson::{self},
};
use serde::{Deserialize, Serialize};

use super::{ user::PubUserInfo, post::Post};

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

impl PostData for BlogContent {
    fn post_type_name() -> &'static str {
        "Blog"
    }

    fn wrap(self) -> crate::PostType {
        PostType::Blog(self)
    }

    fn unwrap(data: crate::PostType) -> Option<Self> {
        match data {
            PostType::Blog(data) => Some(data),
            _ => None,
        }
    }
}

pub type Blog = Post<BlogContent>;