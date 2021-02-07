use model::{PostData, PidType, Post, SessionID};
use serde::de::DeserializeOwned;

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

    pub async fn visit<P: PostData>(&self, post: &P, session_id: &SessionID) -> Result<usize> {
        let not_visited = self.service.redis.session(session_id)
            .add_visit(post.pid(), self.service.option.visit_expire_time.num_seconds() as usize)
            .await
            .map_service_err()?;
    
        if not_visited {
            self.service.model.post.view(post.pid()).await.map_service_err()
        } else {
            Ok(post.stats().views)
        }
    }
}