use model::{HistoryData, MiscellaneousPostContent, Operation, PidType, PostData, PostStats, PostType, SessionID};

use crate::{Service, error::*};

pub struct PostDataService<'s> {
    service: &'s Service,
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
        self.service.model.history.record(uid, Operation::Create, HistoryData::Post(post.data))
            .await?;
        Ok(pid)
    }

    pub async fn visit<P: PostData>(&self, post: &P, session_id: &SessionID) -> Result<usize> {
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