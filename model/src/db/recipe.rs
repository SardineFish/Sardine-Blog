use serde::{Serialize, Deserialize};

use crate::{PostData, PostType};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecipeContent {
    pub title: String,
    pub description: String,
    pub requirements: Vec<String>,
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
            _ => None
        }
    }
}