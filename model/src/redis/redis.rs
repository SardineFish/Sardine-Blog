use super::{access_cache::AccessCache, session::{Session, SessionID}};
use crate::error::*;

pub struct RedisOptions {
    pub addr: String,
}

impl Default for RedisOptions {
    fn default() -> Self {
        Self {
            addr: "redis://localhost".to_string()
        }
    }
}

pub struct RedisCache {
    _client: redis::Client,
    redis: redis::aio::MultiplexedConnection,
}

impl RedisCache {
    pub async fn open(options: RedisOptions) -> Result<Self> {
        let client = redis::Client::open(options.addr.as_str())
            .map_model_result()?;

        let connection = client.get_multiplexed_async_connection()
            .await
            .map_model_result()?;
        
        Ok(Self{
            _client: client,
            redis: connection
        })
    }
    pub fn access(&self) -> AccessCache {
        AccessCache::new(self.redis.clone())
    }
    pub fn session(&self, session_id: SessionID) -> Session {
        Session::with_session_id(session_id, self.redis.clone())
    }
}

pub fn namespace_key(namespace: &str, key: &str) -> String {
    let mut output = String::with_capacity(namespace.len() + key.len() + 1);
    output.push_str(namespace);
    output.push_str(":");
    output.push_str(key);
    output
}