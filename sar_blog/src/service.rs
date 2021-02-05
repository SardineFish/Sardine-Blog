use model::{Model, RedisCache};
use options::ServiceOptions;
use rand::{SeedableRng, prelude::StdRng};

use crate::{blog::BlogService, comment::CommentService, error::MapServiceError, note::NoteService, post_data::PostDataService, session::SessionService, user::UserService};

use crate::error::*;
use std::{cell::RefCell};


#[derive(Clone)]
pub struct Service {
    pub(crate) model: Model,
    pub(crate) redis: RedisCache,
    pub(crate) rng: RefCell<StdRng>,
    pub option: ServiceOptions,
}

impl Service {
    pub async fn open(service_options: ServiceOptions) -> Result<Self> {
        Ok(Self {
            model: Model::open(&service_options).await.map_service_err()?,
            redis: RedisCache::open(&service_options).await.map_service_err()?,
            rng: RefCell::new(StdRng::from_entropy()),
            option: service_options,
        })
    }

    pub fn blog(&self) -> BlogService {
        BlogService::new(self)
    }

    pub fn comment(&self) -> CommentService {
        CommentService::new(&self)
    }

    pub fn note(&self) -> NoteService {
        NoteService::new(&self)
    }

    pub fn user(&self) -> UserService {
        UserService::new(&self)
    }

    pub fn post_data(&self) -> PostDataService {
        PostDataService::new(self)
    }

    pub fn session(&self) -> SessionService {
        SessionService::new(self)
    }
}