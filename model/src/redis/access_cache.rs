use std::collections::HashSet;

use redis::{AsyncCommands, aio::MultiplexedConnection, pipe};

use crate::error::*;

use super::redis::namespace_key;

const NAMESPACE_TOKEN: &str = "user_token";
const NAMESPACE_USER_SESSION: &str = "user_session";
const NAMESPACE_FAKE_USER: &str = "fake_user";

pub struct AccessCache {
    redis: MultiplexedConnection,
}

impl AccessCache {
    pub fn new(redis: MultiplexedConnection) -> Self {
        Self {
            redis
        }
    }

    pub async fn add_token(&mut self, uid: &str, session_id: &str, token: &str, expire: usize) -> Result<()> {
        pipe()
            .set(namespace_key(NAMESPACE_TOKEN, token), uid)
            .expire(namespace_key(NAMESPACE_TOKEN, token), expire)
            .sadd(namespace_key(NAMESPACE_USER_SESSION, uid), session_id)
            .query_async(&mut self.redis)
            .await
            .map_model_result()
    }

    pub async fn get_uid_of_token(&mut self, token: &str) -> Result<Option<String>> {
        self.redis.get(namespace_key(NAMESPACE_TOKEN, token))
            .await
            .map_model_result()
    }

    pub async fn get_sessions_by_uid(&mut self, uid: &str) -> Result<Option<HashSet<String>>> {
        self.redis.smembers(namespace_key(NAMESPACE_USER_SESSION, uid))
            .await
            .map_model_result()
    }

    pub async fn delete_session_token(&mut self, uid: &str, session_id: &str, token: &str) -> Result<Option<String>> {
        pipe()
            .del(namespace_key(NAMESPACE_TOKEN, token))
            .srem(namespace_key(NAMESPACE_USER_SESSION, uid), session_id)
            .query_async(&mut self.redis)
            .await
            .map_model_result()
    }

    pub async fn get_fake_salt(&mut self, uid: &str) -> Result<Option<String>> {
        self.redis.get(namespace_key(NAMESPACE_FAKE_USER, uid))
            .await
            .map_model_result()
    }
    pub async fn set_fake_salt(&mut self, uid: &str, salt: &str, expire: usize) -> Result<()> {
        let key = namespace_key(NAMESPACE_FAKE_USER, uid);
        redis::pipe()
            .set(&key, salt)
            .expire(&key, expire)
            .query_async(&mut self.redis)
            .await
            .map_model_result()
    }
}
