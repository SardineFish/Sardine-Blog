use model::{MiscellaneousPostContent, Operation, PidType, PostData, PostStats, PostType, SessionID, GenericPost, PostMeta};
use serde::{Serialize};

use crate::{Service, error::*};

pub struct PostDataService<'s> {
    service: &'s Service,
}

#[derive(Serialize)]
pub struct RecentActivity {
    #[serde(flatten)]
    pub action: PubActivity,
    pub name: String,
    pub url: String,
    pub time: i64,
}

#[derive(Serialize)]
#[serde(tag="action", content="title")]
pub enum PubActivity {
    PostComment(Option<String>),
    PostNote,
    PostBlog(String),
    UpdateBlog(String),
}

impl<'s> PostDataService<'s> {
    pub fn new(service: &'s Service) -> Self {
        Self {
            service,
        }
    }

    pub async fn post_miscellaneous(&self, uid: &str, content: MiscellaneousPostContent) -> Result<PidType> {
        let post = self.service.model.post.new_post(PostType::Miscellaneous(content), uid)
            .await?;
        self.service.model.post.insert(&post)
            .await?;
        let pid = post.pid;
        self.service.model.history.record(uid, Operation::Create, (post.pid, post.data))
            .await?;
        Ok(pid)
    }

    pub async fn get_post_activities(&self, skip: usize, count: usize) -> Result<Vec<RecentActivity>> {
        let activities = self.service.model.history.get_post_activities(skip, count).await?;
        let mut results = Vec::with_capacity(count);
        for act in activities {
            let (url, action) = match (act.op, act.data) {
                (Operation::Create, PostType::Blog(blog)) => (self.service.url().blog(act.pid), PubActivity::PostBlog(blog.title)),
                (Operation::Update, PostType::Blog(blog)) => (self.service.url().blog(act.pid), PubActivity::UpdateBlog(blog.title)),
                (Operation::Create, PostType::Note(_)) => (self.service.url().note(act.pid), PubActivity::PostNote),
                (Operation::Create, PostType::Comment(comment)) => 
                    match self.service.model.post.get_raw_by_pid(comment.comment_root).await?.data {
                        PostType::Blog(blog) => (self.service.url().blog(act.pid), PubActivity::PostComment(Some(blog.title))),
                        PostType::Note(_) => (self.service.url().note(act.pid), PubActivity::PostComment(None)),
                        PostType::Miscellaneous(content) => (content.url, PubActivity::PostComment(Some(content.name))),
                        _ => continue,
                    },
                _ => continue,
            };
            results.push(RecentActivity {
                name: act.user_name,
                action,
                url,
                time: act.time.timestamp_millis(),
            });
        }

        Ok(results)
    }

    pub async fn visit<P: PostMeta>(&self, post: &P, session_id: &SessionID) -> Result<usize> {
        let not_visited = self.service.redis.session(session_id)
            .add_visit(post.pid(), self.service.option.visit_expire_time.num_seconds() as usize)
            .await?;
    
        if not_visited {
            self.service.model.post.view(post.pid()).await.map_service_err()
        } else {
            Ok(post.stats().views)
        }
    }

    pub async fn get_stats_by_pid(&self, pid: PidType, session_id: &SessionID) -> Result<PostStats> {
        let mut post = self.service.model.post.get_raw_by_pid(pid).await.map_service_err()?;
        let views = self.visit(&post, session_id).await?;
        post.stats.views = views;
        Ok(post.stats)
    }

    pub async fn like(&self, pid: PidType, session_id: &SessionID) -> Result<usize> {
        let unliked =  self.service.redis.session(session_id)
            .add_like(pid, self.service.option.session_expire.num_seconds() as usize)
            .await?;

        if unliked {
            let likes = self.service.model.post.like(pid).await?;
            Ok(likes)
        } else {
            let stats = self.service.model.post.get_stats(pid)
                .await?;
            Ok(stats.likes)
        }
    }

    pub async fn dislike(&self, pid: PidType, session_id: &SessionID) -> Result<usize> {
        let liked = self.service.redis.session(session_id)
            .remove_like(pid, self.service.option.session_expire.num_seconds() as usize)
            .await?;

        if liked {
            let likes = self.service.model.post.dislike(pid).await?;
            Ok(likes)
        } else {
            let stats = self.service.model.post.get_stats(pid).await?;
            Ok(stats.likes)
        }
    }
}