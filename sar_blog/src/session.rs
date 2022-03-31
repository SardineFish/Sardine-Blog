use model::{RedisCache, SessionID};
use rand::{ RngCore};

use crate::{Service};
use crate::error::*;

pub struct SessionService<'s> {
    service: &'s Service,
    redis: &'s RedisCache,
}   

impl<'s> SessionService<'s> {
    pub fn new(service: &'s Service) -> Self {
        Self {
            service,
            redis: &service.redis,
        }
    }
    pub async fn validate(&self, session_id: &SessionID) -> Result<bool> {
        self.redis.session(session_id).exists().await.map_service_err()
    }
    pub async fn new_session(&self) -> Result<SessionID> {
        let mut id: [u8; 16] = [0; 16]; 

        for _ in 0..5 {
            {
                let mut rng = self.service.rng.borrow_mut();
                rng.fill_bytes(&mut id);
            }
            let session_id = hex::encode(id);
            let available = self.redis.session(&session_id).try_init().await.map_service_err()?;
            if available {
                return Ok(session_id);
            }
        }

        Err(Error::InternalServiceError("Failed to generate Session ID"))
    }
    pub async fn throttle(&self, remote_id: &str, interval_seconds: usize) -> Result<()> {
        let mut cache = self.redis.cache("throttle");
        if (cache.get::<Option<i32>>(remote_id).await?).is_some() {
            Err(Error::RateLimit)?
        }
        cache.set_expire(remote_id, 1, interval_seconds).await?;

        Ok(())
    }
}