use std::marker::PhantomData;

use chrono::DateTime;
use chrono::Utc;
use model::PidType;
use model::Post;
use model::PostData;
use model::PostStats;
use model::PubUserInfo;
use model::SessionID;
use serde::Serialize;

use crate::utils::json_datetime_format;

use crate::error::*;
use crate::Service;

#[derive(Clone, Copy)]
pub struct PostService<'s, T> {
    pub(crate) service: &'s crate::Service,
    _phantom: PhantomData<T>,
}

#[derive(Serialize)]
pub struct PubPostData<T: PostData> {
    pub pid: PidType,
    #[serde(with = "json_datetime_format")]
    pub time: DateTime<Utc>,
    pub author: PubUserInfo,
    pub stats: PostStats,
    pub content: T,
}

impl<T: PostData> From<Post<T>> for PubPostData<T> {
    fn from(post: Post<T>) -> Self {
        Self {
            author: post.author,
            content: post.content,
            pid: post.pid,
            stats: post.stats,
            time: post.time.into(),
        }
    }
}

impl<'s, T: PostData> PostService<'s, T> {
    pub fn new(service: &'s Service) -> Self {
        Self {
            service,
            _phantom: PhantomData,
        }
    }

    pub async fn get_preview_list<Preview: From<Post<T>>>(
        &self,
        skip: usize,
        limit: usize,
    ) -> Result<Vec<Preview>> {
        let list = self
            .service
            .model
            .post
            .get_preview_list::<Post<T>>(skip, limit)
            .await?;

        let list = list.into_iter().map(Preview::from).collect();

        Ok(list)
    }

    pub async fn get_by_pid(&self, session_id: &SessionID, pid: PidType) -> Result<Post<T>> {
        let mut post = self
            .service
            .model
            .post
            .get_post_by_pid::<Post<T>>(pid)
            .await?;

        post.stats.views = self.service.post_data().visit(&post, session_id).await?;

        Ok(post)
    }

    pub async fn post(&self, uid: &str, content: T) -> Result<PidType> {
        let user = self.service.model.user.get_by_uid(uid).await?;
        let post = self.service.model.post.new_post(content, &user).await?;

        self.service.model.post.insert(&post.clone().into()).await?;
        let pid = post.pid;

        self.service.search().index(&post).await?;

        self.service
            .model
            .history
            .record(uid, model::Operation::Create, post)
            .await?;

        Ok(pid)
    }

    pub async fn update(&self, pid: PidType, uid: &str, content: T) -> Result<()> {
        self.service
            .model
            .post
            .update_content(pid, &content)
            .await?;

        if T::ALLOW_SEARCH && self.service.option.enable_indexing {
            let post = self
                .service
                .model
                .post
                .get_post_by_pid::<Post<T>>(pid)
                .await?;

            self.service.search().index(&post).await?;
        }

        self.service
            .model
            .history
            .record(uid, model::Operation::Update, (pid, content.wrap()))
            .await?;

        Ok(())
    }

    pub async fn delete(&self, uid: &str, pid: PidType) -> Result<Option<T>> {
        let post: Option<T> = self
            .service
            .model
            .post
            .delete(pid)
            .await
            .map_service_err()?;
        if let Some(content) = post {
            self.service
                .model
                .history
                .record(uid, model::Operation::Delete, (pid, content.clone().wrap()))
                .await?;
            Ok(Some(content))
        } else {
            Ok(None)
        }
    }
}

pub struct PostServiceExtend<'s, T: PostData>(PostService<'s, T>);

impl<'s, T: PostData> PostServiceExtend<'s, T> {
    pub(crate) fn new(service: &'s Service) -> Self {
        Self(PostService::new(service))
    }

    pub(crate) fn inner(&self) -> &PostService<'s, T> {
        &self.0
    }

    pub(crate) fn service(&self) -> &'s Service {
        self.0.service
    }
}
