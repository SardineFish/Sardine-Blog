use chrono::Utc;
use url::Url;

use crate::{DocType, PidType, Post, PostType, error::{MapInternalError, Result}};

#[derive(serde::Serialize)]
struct IndexedDoc {
    pub pid: PidType,
    pub author: String,
    pub tags: Vec<String>,
    pub content: String,
    pub time: i64,
}

const INDEX_NAME: &str = "post";
const TYPE_NAME: &str = "indexed_doc";

#[derive(Clone)]
pub struct ElasticSerachModel {
    base_url: String,
    client: reqwest::Client,
}

impl ElasticSerachModel {
    pub fn new(base_url: String) -> Result<Self> {
        Ok(Self {
            base_url,
            client: reqwest::Client::builder()
                .timeout(tokio::time::Duration::from_secs(3))
                .build()
                .map_internal_err()?,
        })
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

        let url = Url::parse(&self.base_url)
            .map_internal_err()?
            .join(INDEX_NAME)
            .map_internal_err()?
            .join(TYPE_NAME)
            .map_internal_err()?
            .join(&post.pid.to_string())
            .map_internal_err()?;

        let response = self.client.post(url)
            .json(&doc)
            .send()
            .await
            .map_internal_err()?;

        if !response.status().is_success() {
            Err(format!("Failed to index post {}: {}", post.pid, response.status())).map_internal_err()?;
        }
        
        Ok(())
    }

    fn parse_doc(doc: &str, doc_type: DocType) -> String {
        match doc_type {
            DocType::PlainText => doc.to_owned(),
            DocType::HTML => shared::md2plain::html2plain(doc, usize::MAX),
            DocType::Markdown => shared::md2plain::md2plain(doc, usize::MAX),
        }
    }
}