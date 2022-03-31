use shared::ServiceOptions;

use super::{access_cache::AccessCache, generic_cache::GenericCache, session::{Session}};
use crate::error::*;

#[derive(Clone)]
pub struct RedisCache {
    _client: redis::Client,
    redis: redis::aio::MultiplexedConnection,
}

impl RedisCache {
    pub async fn open(options: &ServiceOptions) -> Result<Self> {
        let client = redis::Client::open(options.redis_addr.as_str())
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
    pub fn session<'s>(&self, session_id: &'s str) -> Session<'s> {
        Session::with_session_id(session_id, self.redis.clone())
    }
    pub fn cache(&self, namespace: &'static str) -> GenericCache {
        GenericCache::new(self.redis.clone(), namespace)
    }
}

pub fn namespace_key(namespace: &str, key: &str) -> String {
    let mut output = String::with_capacity(namespace.len() + key.len() + 1);
    output.push_str(namespace);
    output.push(':');
    output.push_str(key);
    output
}