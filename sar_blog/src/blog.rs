
use chrono::{DateTime, Utc};
use model::{Blog, BlogContent, Model, PidType, PostType, PubUserInfo, RedisCache, SessionID};
use serde::{Serialize};
use shared::md2plain::{html2plain, md2plain, slice_utf8};

use crate::{Service, error::*, utils};
use utils::json_datetime_format;

pub struct BlogService<'m> {
    service: &'m Service,
    model: &'m Model,
    _redis: &'m RedisCache
}

#[derive(Serialize)]
pub struct BlogPreview {
    pub pid: PidType,
    pub title: String,
    #[serde(with="json_datetime_format")]
    pub time: DateTime<Utc>,
    pub tags: Vec<String>,
    pub author: PubUserInfo,
    pub preview: String, 
}

impl BlogPreview {
    pub fn from_blog(blog: Blog, words_limit: usize) -> BlogPreview {
        
        let preview = match blog.doc_type {
            model::DocType::PlainText => slice_utf8(&blog.doc, words_limit).to_owned(),
            model::DocType::Markdown => md2plain(&blog.doc, words_limit),
            model::DocType::HTML => slice_utf8(&html2plain(&blog.doc), words_limit).to_owned(),
        };

        BlogPreview {
            pid: blog.pid,
            title: blog.title,
            time: blog.time.into(),
            tags: blog.tags,
            author: blog.author,
            preview,
        }
    }
}

impl<'m> BlogService<'m> {
    pub fn new(service: &'m Service) -> Self {
        Self{
            service,
            model: &service.model,
            _redis: &service.redis,
        }
    }

    pub async fn get_preview_list(&self, skip: usize, limit: usize) -> Result<Vec<BlogPreview>> {
        let list: Vec<Blog> = self.model.post.get_list::<Blog>(skip, limit)
            .await
            .map_service_err()?;
        
        let list = list.into_iter()
            .map(|blog| BlogPreview::from_blog(blog, 300))
            .collect();
        
        Ok(list)
    }

    pub async fn get_by_pid(&self, session_id: &SessionID, pid: PidType) -> Result<Blog> {
        let mut blog: Blog = self.model.post.get_post_by_pid(pid)
            .await
            .map_service_err()?;

        blog.stats.views = self.service.post_data().visit(&blog, &session_id)
            .await
            .map_service_err()?;

        Ok(blog)
    }

    pub async fn post(&self, uid: &str, blog_content: BlogContent) -> Result<PidType> {
        let user = self.model.user.get_by_uid(&uid).await.map_service_err()?;
        let post_type = PostType::Blog(blog_content);
        let post = self.model.post.new_post(post_type, &user.uid)
            .await
            .map_service_err()?;
        
        self.model.post.insert(&post).await.map_service_err()?;
        let pid = post.pid;

        self.model.history.record(uid, model::Operation::Create, post)
            .await
            .map_service_err()?;

        Ok(pid)
    }

    pub async fn update(&self, pid: PidType, uid: &str, blog_content: BlogContent) -> Result<()> {
        self.model.post.update_content(pid, &blog_content)
            .await
            .map_service_err()?;
        
        self.model.history.record(uid, model::Operation::Update, (pid, PostType::Blog(blog_content)))
            .await
            .map_service_err()?;

        Ok(())
    }

    pub async fn delete(&self, uid: &str, pid: PidType) -> Result<Option<BlogContent>> {

        let post: Option<BlogContent> = self.model.post.delete(pid).await.map_service_err()?;
        if let Some(content) = post {
            self.model.history.record(uid, model::Operation::Delete, (pid, PostType::Blog(content.clone())))
                .await
                .map_service_err()?;
            Ok(Some(content))
        } else {
            Ok(None)
        }
    }
}