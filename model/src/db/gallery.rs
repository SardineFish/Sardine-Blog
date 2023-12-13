use std::collections::HashMap;

use crate::{PostData, PostType};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExhibitContent {
    title: String,
    url: String,
    description: String,
    meta: HashMap<String, String>,
}

impl PostData for ExhibitContent {
    fn post_type_name() -> &'static str {
        "Exhibit"
    }

    fn wrap(self) -> crate::PostType {
        crate::PostType::Exhibit(self)
    }

    fn unwrap(data: crate::PostType) -> Option<Self> {
        match data {
            PostType::Exhibit(pic) => Some(pic),
            _ => None,
        }
    }

    fn ignore_fields_on_preview() -> &'static [&'static str] {
        &[]
    }
}
