use model::{ Model, RedisCache};
use options::ServiceOptions;

use crate::{blog::BlogService, comment::CommentService, error::MapServiceError, note::NoteService, user::UserService};

use crate::error::*;

pub struct DBModel<'m> {
    db: &'m Model,
    redis: RedisCache,
}

pub struct Service {
    pub(crate) model: Model,
    pub(crate) redis: RedisCache
}

impl Service {
    pub async fn open(service_options: ServiceOptions) -> Result<Self> {
        Ok(Self {
            model: Model::open(&service_options).await.map_service_err()?,
            redis: RedisCache::open(&service_options).await.map_service_err()?,
        })
    }

    pub fn blog(&self) -> BlogService {
        BlogService::new(&self.model, &self.redis)
    }

    pub fn comment(&self) -> CommentService {
        CommentService::new(&self)
    }

    pub fn note(&self) -> NoteService {
        NoteService::new(&self.model)
    }
    pub fn user(&self) -> UserService {
        UserService::new(&self)
    }
}