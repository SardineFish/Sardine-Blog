use model::{DBOptions, Model, RedisCache, RedisOptions};

use crate::{blog::BlogService, comment::CommentService, error::MapServiceError, note::NoteService, user::UserService};

use crate::error::*;

pub struct DBModel<'m> {
    db: &'m Model,
    redis: RedisCache,
}

pub struct Service {
    model: Model,
    redis: RedisCache
}

impl Service {
    pub async fn open(db_options: DBOptions, redis_options: RedisOptions) -> Result<Self> {
        Ok(Self {
            model: Model::open(db_options).await.map_service_err()?,
            redis: RedisCache::open(redis_options).await.map_service_err()?,
        })
    }

    pub fn blog(&self) -> BlogService {
        BlogService::new(&self.model, &self.redis)
    }

    pub fn comment(&self) -> CommentService {
        CommentService::new(&self.model)
    }

    pub fn note(&self) -> NoteService {
        NoteService::new(&self.model)
    }
    pub fn user(&self) -> UserService {
        UserService::new(&self.model)
    }
}