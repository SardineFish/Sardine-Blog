use model::{HistoryData, Model, Note, NoteContent, PidType, PostType, RedisCache};

use crate::{error::*, user::Author, validate::Validate};
use crate::service::Service;

pub struct NoteService<'m> {
    model: &'m Model,
    _redis: &'m RedisCache,
    service: &'m Service,
}

impl<'m> NoteService<'m> {
    pub fn new(service: &'m Service) -> Self {
        Self {
            service,
            model: &service.model,
            _redis: &service.redis,
        }
    }

    pub async fn get_list(&self, skip: usize, limit: usize) -> Result<Vec<Note>> {
        self.model.post.get_list(skip, limit)
            .await
            .map_service_err()
    }

    pub async fn post(&self, author: Author, content: NoteContent) -> Result<PidType> {
        let user = match author {
            Author::Anonymous(info) => self.service.user().get_anonymous(&info).await?,
            Author::Authorized(auth) => 
                self.model.user.get_by_uid(&auth.uid).await.map_service_err()?
        };
        content.validate_with_access(user.access)?;

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