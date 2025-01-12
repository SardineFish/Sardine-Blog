use std::collections::HashMap;

use crate::{PostData, PostType};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ExhibitMeta {
    Number(f64),
    String(String),
    Array(Vec<ExhibitMeta>),
    Obj(HashMap<String, ExhibitMeta>),
}

impl ExhibitMeta {
    pub fn get(&self, path: &str) -> Option<&Self> {
        if path.is_empty() {
            return Some(self);
        }

        if let Self::Obj(map) = self {
            get_meta_value(map, path)
        } else {
            None
        }
    }
}

fn get_meta_value<'a>(
    map: &'a HashMap<String, ExhibitMeta>,
    path: &str,
) -> Option<&'a ExhibitMeta> {
    if path.is_empty() {
        return None;
    }

    let (key, next_key) = match path.split_once(".") {
        Some((current, next)) => (current, next),
        None => (path, ""),
    };

    map.get(key).and_then(|value| value.get(next_key))
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExhibitContent {
    pub title: String,
    pub url: String,
    pub description: String,
    pub meta: HashMap<String, ExhibitMeta>,
}

impl ExhibitContent {
    pub fn is_album(&self) -> bool {
        match self.get_meta("type") {
            Some(ExhibitMeta::String(s)) if s == "Album" => true,
            _ => false,
        }
    }

    pub fn pic_count(&self) -> usize {
        match self.get_meta("count") {
            Some(ExhibitMeta::Number(x)) => *x as usize,
            _ => 1,
        }
    }

    pub fn get_meta(&self, path: &str) -> Option<&ExhibitMeta> {
        get_meta_value(&self.meta, path)
    }
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
        &["meta.album"]
    }
}
