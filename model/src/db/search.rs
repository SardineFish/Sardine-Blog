use chrono::Utc;
use serde_json::json;
use url::Url;

use crate::{
    error::{MapInternalError, Result},
    DocType, PidType, Post, PostType,
};

#[derive(serde::Serialize)]
struct IndexedDoc {
    pub pid: PidType,
    pub author: String,
    pub tags: Vec<String>,
    pub content: String,
    pub time: i64,
}

const INDEX_NAME: &str = "post/";
const TYPE_NAME: &str = "_doc/";

#[derive(Clone)]
pub struct ElasticSerachModel {
    base_url: Url,
    client: reqwest::Client,
}

impl ElasticSerachModel {
    pub fn new(base_url: String) -> Result<Self> {
        Ok(Self {
            base_url: Url::parse(&base_url).map_internal_err()?,
            client: reqwest::Client::builder()
                .timeout(tokio::time::Duration::from_secs(3))
                .build()
                .map_internal_err()?,
        })
    }

    pub async fn init_index(&self) -> Result<()> {
        // Create index
        self.client
            .put(self.base_url.join(INDEX_NAME).map_internal_err()?)
            .json(&json!({
              "settings": {
                "analysis": {
                  "analyzer": {
                    "default": {
                      "type": "ik_max_word"
                    },
                    "default_search": {
                      "type": "ik_max_word"
                    }
                  }
                }
              },
              "mappings": {
                "dynamic": false,
                "properties": {
                  "pid": {
                    "type": "long",
                    "index": false
                  },
                  "author": { "type": "text" },
                  "tags": { "type": "text" },
                  "content": { "type": "text" },
                  "time": {
                    "type": "long",
                    "index": false
                  }
                }
              }
            }))
            .send()
            .await
            .map_internal_err()?;

        Ok(())
    }

    pub async fn insert_post(&self, post: &Post, author: String) -> Result<()> {
        let (tags, content) = match &post.data {
            PostType::Blog(blog) => (blog.tags.clone(), Self::parse_doc(&blog.doc, blog.doc_type)),
            PostType::Note(note) => (vec![], Self::parse_doc(&note.doc, note.doc_type)),
            _ => Err("Invalid operation").map_internal_err()?,
        };
        let doc = IndexedDoc {
            pid: post.pid,
            author,
            tags,
            content,
            time: Utc::now().timestamp_millis(),
        };

        let url = self.base_url
            .join(INDEX_NAME)
            .map_internal_err()?
            .join(TYPE_NAME)
            .map_internal_err()?
            .join(&post.pid.to_string())
            .map_internal_err()?;

        log::info!("{}", url);

        let response = self
            .client
            .put(url)
            .json(&doc)
            .send()
            .await
            .map_internal_err()?;

        if !response.status().is_success() {
            Err(format!(
                "Failed to index post {}: {}",
                post.pid,
                response.status()
            ))
            .map_internal_err()?;
        }

        Ok(())
    }

    fn parse_doc(doc: &str, doc_type: DocType) -> String {
        match doc_type {
            DocType::PlainText => doc.to_owned(),
            DocType::HTML => shared::md2plain::html2plain(doc),
            DocType::Markdown => shared::md2plain::md2plain(doc, usize::MAX),
        }
    }
}
