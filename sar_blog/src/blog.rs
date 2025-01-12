use chrono::{DateTime, Utc};
use model::{Blog, BlogContent, DocType, PidType, PubUserInfo};
use serde::Serialize;
use shared::md2plain::{html2plain, md2plain, slice_utf8};

use crate::{post::PostService, utils};
use utils::json_datetime_format;

const PREVIEW_WORDS: usize = 300;

#[derive(Serialize)]
pub struct BlogPreview<const MAX_WORDS: usize = PREVIEW_WORDS> {
    pub pid: PidType,
    pub title: String,
    #[serde(with = "json_datetime_format")]
    pub time: DateTime<Utc>,
    pub tags: Vec<String>,
    pub author: PubUserInfo,
    pub preview: String,
}

impl<const W: usize> BlogPreview<W> {
    pub fn get_content_preview(doc_type: DocType, content: &str) -> String {
        get_preview_slice(doc_type, content, W)
    }
}

impl<const W: usize> From<Blog> for BlogPreview<W> {
    fn from(blog: Blog) -> Self {
        let preview = get_preview_slice(blog.doc_type, &blog.doc, W);

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

pub fn get_preview_slice(doc_type: DocType, content: &str, max_len: usize) -> String {
    match doc_type {
        model::DocType::PlainText => slice_utf8(content, max_len).to_owned(),
        model::DocType::Markdown => md2plain(content, max_len),
        model::DocType::HTML => slice_utf8(&html2plain(content), max_len).to_owned(),
    }
}

pub type BlogService<'s> = PostService<'s, BlogContent>;
