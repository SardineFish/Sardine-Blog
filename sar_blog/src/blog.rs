use chrono::{DateTime, Utc};
use model::{Blog, BlogContent, PidType, PubUserInfo};
use serde::Serialize;
use shared::md2plain::{html2plain, md2plain, slice_utf8};

use crate::{post::PostService, utils};
use utils::json_datetime_format;

const PREVIEW_WORDS: usize = 300;

#[derive(Serialize)]
pub struct BlogPreview {
    pub pid: PidType,
    pub title: String,
    #[serde(with = "json_datetime_format")]
    pub time: DateTime<Utc>,
    pub tags: Vec<String>,
    pub author: PubUserInfo,
    pub preview: String,
}

impl From<Blog> for BlogPreview {
    fn from(blog: Blog) -> Self {
        let preview = match blog.content.doc_type {
            model::DocType::PlainText => slice_utf8(&blog.doc, PREVIEW_WORDS).to_owned(),
            model::DocType::Markdown => md2plain(&blog.doc, PREVIEW_WORDS),
            model::DocType::HTML => slice_utf8(&html2plain(&blog.doc), PREVIEW_WORDS).to_owned(),
        };

        BlogPreview {
            pid: blog.pid,
            title: blog.content.title,
            time: blog.time.into(),
            tags: blog.content.tags,
            author: blog.author,
            preview,
        }
    }
}

pub type BlogService<'s> = PostService<'s, BlogContent>;
