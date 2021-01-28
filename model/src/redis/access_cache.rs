use std::collections::HashSet;

use redis::{AsyncCommands, aio::MultiplexedConnection};

use crate::error::*;

use super::redis::namespace_key;

const NAMESPACE_TOKEN: &str = "user_token";
const NAMESPACE_USER_SESSION: &str = "user_session";

pub struct AccessCache {
    redis: MultiplexedConnection,
}

impl AccessCache {
    pub fn new(redis: MultiplexedConnection) -> Self {
        Self {
            redis
        }
    }

    pub async fn get_uid_of_token(&mut self, token: &str) -> Result<Option<String>> {
        self.redis.get(namespace_key(NAMESPACE_TOKEN, token))
            .await
            .map_model_result()
    }

    pub async fn set_uid_of_token(&mut self, token: &str, uid: &str) -> Result<()> {
        self.redis.set(namespace_key(NAMESPACE_TOKEN, token), uid)
            .await
            .map_model_result()
    }

    pub async fn set_token_expire(&mut self, token: &str, lifetime_seconds: usize) -> Result<()> {
        self.redis.expire(namespace_key(NAMESPACE_TOKEN, token), lifetime_seconds)
            .await
            .map_model_result()
    }

    pub async fn get_sessions_by_uid(&mut self, uid: &str) -> Result<Option<HashSet<String>>> {
        self.redis.smembers(namespace_key(NAMESPACE_USER_SESSION, uid))
            .await
            .map_model_result()
    }

    pub async fn add_session_by_uid(&mut self, uid: &str, session_id: &str) -> Result<()> {
        self.redis.sadd(namespace_key(NAMESPACE_USER_SESSION, uid), session_id)
            .await
            .map_model_result()
    }
}
