use std::ops::Add;

use chrono::{Duration, Utc};
use model::{Blog, BlogContent, History, HistoryData, Model, PidType, Post, RedisCache, SessionID};

use crate::{error::*, service::DBModel, utils, visit::update_visit_count};

pub struct BlogService<'m> {
    model: &'m Model,
    redis: &'m RedisCache
}

pub struct BlogPreview {
    pub pid: PidType,
    pub title: String,
    pub tags: Vec<String>,
    pub author: String,
    pub preview: String, 
}

impl BlogPreview {
    pub fn from_blog(blog: Blog, words_limit: usize) -> BlogPreview {
        let parser = pulldown_cmark::Parser::new(&blog.doc);
        
        let preview = utils::write_plaintext(parser, words_limit);

        BlogPreview {
            pid: blog.pid,
            title: blog.title,
            tags: blog.tags,
            author: blog.author,
            preview,
        }
    }
}

impl<'m> BlogService<'m> {
    pub fn new(model: &'m Model, redis: &'m RedisCache) -> Self {
        Self{
            model,
            redis
        }
    }

    pub async fn get_preview_list(&self, skip: usize, limit: usize) -> Result<Vec<BlogPreview>> {
        let list: Vec<Blog> = self.model.post.get_list(skip, limit)
            .await
            .map_service_err()?;
        
        let list = list.into_iter()
            .map(|blog| BlogPreview::from_blog(blog, 200))
            .collect();
        
        Ok(list)
    }

    pub async fn get_by_pid(&self, session_id: &SessionID, pid: PidType) -> Result<Blog> {
        let mut blog: Blog = self.model.post.get_by_pid(pid)
            .await
            .map_service_err()?;

        blog.stats.views = update_visit_count(&self.model, &self.redis, &blog, session_id)
            .await
            .map_service_err()?;

        Ok(blog)
    }

    pub async fn post(&self, uid: &str, blog_content: BlogContent) -> Result<PidType> {
        let pid = self.model.post_data.new_pid().await.map_service_err()?;
        let user = self.model.user.get_by_uid(&uid).await.map_service_err()?;
        let blog = Blog::new(pid, &user, blog_content);

        self.model.post.post(&blog).await.map_service_err()?;
        self.model.comment.init_comment(pid).await.map_service_err()?;
        self.model.history.record(uid, model::Operation::Create, HistoryData::Blog(blog))
            .await
            .map_service_err()?;

        Ok(pid)
    }

    pub async fn delete(&self, uid: &str, pid: PidType) -> Result<Option<Blog>> {
        let blog: Option<Blog> = self.model.post.delete(pid).await.map_service_err()?;

        if let Some(blog) = &blog {
            self.model.history.record(uid, model::Operation::Delete, HistoryData::Blog(blog.clone()))
                .await
                .map_service_err()?;
        }

        Ok(blog)
    }
}