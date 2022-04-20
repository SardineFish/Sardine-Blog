use crate::{PostData, PostType};
use mongodb::bson::doc;
use mongodb::{self};
use serde::{Deserialize, Serialize};

use super::post::{get_content_preview, Post};
use super::search::{ElasticSerachModel, IndexDoc};

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
    const ALLOW_SEARCH: bool = true;

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

    fn search_index(&self) -> Option<super::search::IndexDoc> {
        Some(IndexDoc {
            title: self.title.clone(),
            tags: self.tags.clone(),
            preview: get_content_preview(self.doc_type, &self.doc, 300),
            content: ElasticSerachModel::parse_doc(&self.doc, self.doc_type),
        })
    }
}

pub type Blog = Post<BlogContent>;
