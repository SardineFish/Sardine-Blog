use serde::{Deserialize, Serialize};

use crate::{blog::DocType, PostData, PostType};

use super::{
    post::{get_content_preview, Post},
    search::{ElasticSerachModel, IndexDoc},
};

#[derive(Serialize, Deserialize, Clone)]
pub struct NoteContent {
    pub doc_type: DocType,
    pub doc: String,
}

impl PostData for NoteContent {
    const ALLOW_SEARCH: bool = true;
    fn post_type_name() -> &'static str {
        "Note"
    }

    fn wrap(self) -> crate::PostType {
        PostType::Note(self)
    }

    fn unwrap(data: crate::PostType) -> Option<Self> {
        match data {
            PostType::Note(note) => Some(note),
            _ => None,
        }
    }

    fn search_index(&self) -> Option<super::search::IndexDoc> {
        Some(IndexDoc {
            title: String::new(),
            tags: Vec::new(),
            preview: get_content_preview(self.doc_type, &self.doc, 300),
            content: ElasticSerachModel::parse_doc(&self.doc, self.doc_type),
        })
    }
    fn ignore_fields_on_preview() -> &'static [&'static str] {
        &[]
    }
}

pub type Note = Post<NoteContent>;
