use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::json;
use url::Url;

use crate::{
    db::post::get_content_preview,
    error::{MapInternalError, Result},
    DocType, PidType, PostDoc, PostType,
};

#[derive(Serialize)]
struct IndexedDoc {
    pub pid: PidType,
    pub author: String,
    pub tags: Vec<String>,
    pub content: String,
    pub preview: String,
    pub title: String,
    pub time: i64,
    pub doc_type: &'static str,
}

const URL_INDEX: &str = "/post";
const URL_RESOURCE: &str = "/post/_doc/";
const URL_SEARCH: &str = "/post/_search";
const PREVIEW_CHARS: usize = 300;

#[derive(Clone)]
pub struct ElasticSerachModel {
    base_url: Url,
    client: reqwest::Client,
}

impl ElasticSerachModel {
    pub fn new(base_url: String) -> Result<Self> {
        Ok(Self {
            base_url: Url::parse(&base_url).map_search_err("Invalid api url")?,
            client: reqwest::Client::builder()
                .timeout(tokio::time::Duration::from_secs(3))
                .build()
                .map_search_err("Failed to build reqest client")?,
        })
    }

    pub async fn init_index(&self) -> Result<()> {
        // Create index
        self.client
            .put(
                self.base_url
                    .join(URL_INDEX)
                    .map_search_err("Build url failed")?,
            )
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
                  "preview": {
                    "type": "text",
                    "index": false
                  },
                  "time": {
                    "type": "long",
                    "index": false
                  },
                  "doc_type": {
                    "type": "keyword",
                    "index": false
                  },
                  "title": { "type": "text" },
                  "author": { "type": "text" },
                  "tags": { "type": "text" },
                  "content": { "type": "text" },
                }
              }
            }))
            .send()
            .await
            .map_search_err("Failed to create index")?;

        Ok(())
    }

    pub async fn insert_post(&self, post: &PostDoc, author: &str) -> Result<()> {
        let (title, tags, content, preview) = match &post.data {
            PostType::Blog(blog) => (
                blog.title.clone(),
                blog.tags.clone(),
                Self::parse_doc(&blog.doc, blog.doc_type),
                get_content_preview(blog.doc_type, &blog.doc, PREVIEW_CHARS),
            ),
            PostType::Note(note) => (
                String::new(),
                vec![],
                Self::parse_doc(&note.doc, note.doc_type),
                get_content_preview(note.doc_type, &note.doc, PREVIEW_CHARS),
            ),
            _ => Err("Invalid operation").map_search_err("Invalid post to index")?,
        };
        let doc = IndexedDoc {
            pid: post.pid,
            author: author.to_string(),
            tags,
            title,
            preview,
            doc_type: post.data.type_name(),
            content,
            time: Utc::now().timestamp_millis(),
        };

        let url = self
            .base_url
            .join(URL_RESOURCE)
            .map_internal_err()?
            .join(&post.pid.to_string())
            .map_search_err("Failed to build API url")?;

        log::info!("{}", url);

        let response = self
            .client
            .put(url)
            .json(&doc)
            .send()
            .await
            .map_search_err("Failed to send indexing post")?;

        if !response.status().is_success() {
            Err("Indexing failed").map_search_err(&format!(
                "Failed to index post {}: {}",
                post.pid,
                response.status()
            ))?;
        }

        Ok(())
    }

    pub async fn search(&self, query: &str, skip: usize, count: usize) -> Result<SearchResult> {
        let data = json!({
          "query": {
            "bool": {
              "should": [
                {
                  "match": {
                    "title": {
                      "query": query,
                      "boost": 3
                    }
                  }
                },
                {
                  "match": {
                    "tags": {
                      "query": query,
                      "boost": 2
                    }
                  }
                },
                {
                  "match": {
                    "content": {
                      "query": query,
                      "boost": 1
                    }
                  }
                },
                {
                  "match": {
                    "author": {
                      "query": query,
                      "boost": 0.5
                    }
                  }
                }
              ]
            }
          },
          "fields": [
            "pid",
            "author",
            "tags",
            "time",
            "title",
            "preview",
            "doc_type"
          ],
          "_source": false,
          "from": skip,
          "size": count,
          "highlight": {
            "fields": {
              "tags": {},
              "author": {},
              "content": {
                "number_of_fragments" : 3
              },
              "title": {}
            }
          },
          "sort": [
            "_score",
            { "time": "desc" }
          ]
        });

        let url = self.base_url.join(URL_SEARCH).map_internal_err()?;

        let response = self
            .client
            .post(url)
            .json(&data)
            .send()
            .await
            .map_search_err("Failed to send search request")?;

        match response.status() {
            status if status.is_success() => {
                let result = response
                    .json::<ElasticSearchResult>()
                    .await
                    .map_internal_err()?;
                Ok(result.into())
            }
            status => {
                let body = response.text().await.map_internal_err()?;
                log::error!(
                    "Failed to call search api with search '{}': Status: {} \r\n Response: {}",
                    query,
                    status,
                    body
                );
                Err(format!(
                    "Failed to call search api with search '{}': {}",
                    query, status
                ))
                .map_internal_err()
            }
        }
    }

    fn parse_doc(doc: &str, doc_type: DocType) -> String {
        match doc_type {
            DocType::PlainText => doc.to_owned(),
            DocType::HTML => shared::md2plain::html2plain(doc),
            DocType::Markdown => shared::md2plain::md2plain(doc, usize::MAX),
        }
    }
}

#[derive(serde::Serialize)]
pub struct SearchResult {
    time: i64,
    timeout: bool,
    total_hits: usize,
    results: Vec<HitInfo>,
}

#[derive(serde::Serialize)]
pub struct HitInfo {
    pid: PidType,
    time: i64,
    author: String,
    title: String,
    preview: String,
    doc_type: String,
    tags: Vec<String>,
    highlight: SearchHighlight,
}

#[derive(serde::Serialize)]
pub struct SearchHighlight {
    title: Option<String>,
    tags: Option<Vec<String>>,
    author: Option<String>,
    content: Option<Vec<String>>,
}

impl From<ElasticSearchResult> for SearchResult {
    fn from(result: ElasticSearchResult) -> Self {
        Self {
            total_hits: result.hits.total.value,
            time: result.took,
            timeout: result.timed_out,
            results: result.hits.hits.into_iter().map(HitInfo::from).collect(),
        }
    }
}

impl From<ElasticHitInfo> for HitInfo {
    fn from(mut hit: ElasticHitInfo) -> Self {
        Self {
            author: hit.fields.author.swap_remove(0),
            doc_type: hit.fields.doc_type.swap_remove(0),
            pid: hit.fields.pid[0],
            time: hit.fields.time[0],
            tags: hit.fields.tags.unwrap_or_default(),
            title: hit.fields.title.swap_remove(0),
            preview: hit.fields.preview.swap_remove(0),
            highlight: SearchHighlight {
                title: hit.highlight.title.map(|mut t| t.swap_remove(0)),
                author: hit.highlight.author.map(|mut t| t.swap_remove(0)),
                tags: hit.highlight.tags,
                content: hit.highlight.content,
            },
        }
    }
}

#[derive(Deserialize)]
struct ElasticSearchResult {
    took: i64,
    timed_out: bool,
    hits: ElasticSearchHits,
}

#[derive(Deserialize)]
struct ElasticSearchHits {
    total: TotalHits,
    hits: Vec<ElasticHitInfo>,
}

#[derive(Deserialize)]
struct TotalHits {
    value: usize,
}
#[derive(Deserialize)]
struct ElasticHitInfo {
    fields: DocFields,
    highlight: DocHighlight,
}
#[derive(Deserialize)]
struct DocFields {
    author: Vec<String>,
    pid: Vec<PidType>,
    time: Vec<i64>,
    title: Vec<String>,
    doc_type: Vec<String>,
    tags: Option<Vec<String>>,
    preview: Vec<String>,
}
#[derive(Deserialize)]
struct DocHighlight {
    title: Option<Vec<String>>,
    author: Option<Vec<String>>,
    tags: Option<Vec<String>>,
    content: Option<Vec<String>>,
}
