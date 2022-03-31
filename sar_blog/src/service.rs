use model::{AuthenticationInfo, Model, RedisCache, User};
use shared::ServiceOptions;
use rand::{RngCore, SeedableRng, prelude::StdRng};
use sha2::{Digest, Sha256};

use crate::{blog::BlogService, comment::CommentService, email_notify::EmailNotifyService, error::MapServiceError, note::NoteService, post_data::PostDataService, rank::{RankServiceSelector}, search::SearchService, session::SessionService, storage::StorageService, url::UrlService, user::UserService};

use crate::error::*;
use std::{cell::RefCell};


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
        CommentService::new(self)
    }

    pub fn note(&self) -> NoteService {
        NoteService::new(self)
    }

    pub fn user(&self) -> UserService {
        UserService::new(self)
    }

    pub fn post_data(&self) -> PostDataService {
        PostDataService::new(self)
    }

    pub fn session(&self) -> SessionService {
        SessionService::new(self)
    }

    pub fn storage(&self) -> StorageService {
        StorageService::new(self)
    }

    pub fn rank(&self) -> RankServiceSelector {
        RankServiceSelector::new(self)
    }

    pub fn search(&self) -> SearchService {
        SearchService::new(self)
    }

    pub fn push_service(&self) -> EmailNotifyService {
        EmailNotifyService::new(self)
    }

    pub fn url(&self) -> UrlService {
        UrlService::new(self)
    }

    pub async fn init_database(&self, index_only: bool) -> Result<()> {
        if index_only {
            self.model.init(false).await?;
        } else {
            log::warn!("Init database...");
            log::warn!("Will rewrite some metadata in database which is very important!");
            self.model.init(true).await.map_service_err()?;
            
            log::warn!("Secrete of root user will be generated randomly, please make sure to change it.");
            let mut secret: [u8; 16] = [0; 16];
            self.rng.borrow_mut().fill_bytes(&mut secret);
            let hash = format!("{:x}", Sha256::digest(&secret));
            
            let user = User::root(AuthenticationInfo{
                method: model::HashMethod::SHA256,
                password_hash: hash.clone(),
                salt: "".to_string()
            });
        
            self.model.user.add(&user).await.map_service_err()?;
        
            log::warn!("The secrete of root is '{}'", hash);
        
            log::warn!("Init completed.");
        }
        
        Ok(())
    }
}

impl Clone for Service {
    fn clone(&self) -> Self {
        Self {
            model: self.model.clone(),
            option: self.option.clone(),
            redis: self.redis.clone(),
            rng: RefCell::new(StdRng::from_entropy()),
        }
    }
}