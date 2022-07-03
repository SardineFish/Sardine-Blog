use serde::{Deserialize, Serialize};

use crate::{PostData, PostType};

use super::search::{ElasticSerachModel, IndexDoc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecipeContent {
    pub title: String,
    pub description: String,
    pub requirements: Vec<String>,
    #[serde(default)]
    pub optional: Vec<String>,
    #[serde(default)]
    pub content: String,
}

impl PostData for RecipeContent {
    const ALLOW_SEARCH: bool = true;
    fn post_type_name() -> &'static str {
        "Recipe"
    }

    fn wrap(self) -> crate::PostType {
        PostType::Recipe(self)
    }

    fn unwrap(data: crate::PostType) -> Option<Self> {
        match data {
            PostType::Recipe(data) => Some(data),
            _ => None,
        }
    }

    fn search_index(&self) -> Option<super::search::IndexDoc> {
        Some(IndexDoc {
            title: self.title.clone(),
            tags: self.requirements.clone(),
            preview: self.description.clone(),
            content: ElasticSerachModel::parse_doc(&self.content, crate::DocType::Markdown),
        })
    }

    fn ignore_fields_on_preview() -> &'static [&'static str] {
        &["content"]
    }
}
