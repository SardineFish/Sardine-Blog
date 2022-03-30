
use serde::{Serialize, Deserialize};

use crate::{ blog::DocType, PostData, PostType};

use super::{ post::Post};

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
            _ => None
        }
    }
}

pub type Note = Post<NoteContent>;
