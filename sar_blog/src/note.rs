use model::{AnonymousUserInfo, DocType, Model, Note, PidType, RedisCache, SessionID};

use crate::error::*;
use crate::service::Service;

pub struct NoteService<'m> {
    model: &'m Model,
    redis: &'m RedisCache,
    service: &'m Service,
}

impl<'m> NoteService<'m> {
    pub fn new(service: &'m Service) -> Self {
        Self {
            service,
            model: &service.model,
            redis: &service.redis,
        }
    }

    pub async fn get_list(&self, skip: usize, limit: usize) -> Result<Vec<Note>> {
        self.model.post.get_list(skip, limit)
            .await
            .map_service_err()
    }

    pub async fn post(&self, session_id: &SessionID, author_info: &AnonymousUserInfo, doc_type: DocType,  content: &str) -> Result<PidType> {
        let uid = self.redis.session(session_id).uid().await.map_service_err()?;
        let user = match &uid {
            Some(uid) => self.model.user.get_by_uid(uid).await.map_service_err()?,
            None => self.service.user().get_anonymous(author_info).await?
        };
        let pid = self.model.post_data.new_pid().await.map_service_err()?;

        let note = Note::new(pid, &user, doc_type, &content);

        self.model.post.post(&note).await.map_service_err()?;
        Ok(pid)
    }
}