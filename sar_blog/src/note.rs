use model::{AnonymousUserInfo, DocType, HistoryData, Model, Note, NoteContent, PidType, PostType, RedisCache, SessionID};

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

    pub async fn post(&self, session_id: &SessionID, author_info: Option<&AnonymousUserInfo>, content: NoteContent) -> Result<PidType> {
        let user = match author_info {
            Some(info) => self.service.user().get_anonymous(info).await?,
            None => {
                let uid = self.redis.session(&session_id).uid()
                .await
                .map_service_err()?
                .ok_or(Error::Unauthorized)?;

                self.model.user.get_by_uid(&uid).await.map_service_err()?
            },
        };
        let note = PostType::Note(content);
        let post = self.model.post.new_post(note, &user)
            .await
            .map_service_err()?;
        
        self.model.post.insert(&post).await.map_service_err()?;

        self.model.history.record(&user.uid, model::Operation::Create, HistoryData::Post(post.data))
            .await
            .map_service_err()?;

        Ok(post.pid)
    }
}