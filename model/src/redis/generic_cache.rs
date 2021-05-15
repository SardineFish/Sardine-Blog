use redis::{FromRedisValue, ToRedisArgs, aio::MultiplexedConnection};
use redis::AsyncCommands;
use crate::error::Result;

pub struct GenericCache {
    namespace: &'static str,
    redis: MultiplexedConnection,
}

impl GenericCache {
    pub fn new(redis: MultiplexedConnection, namespace: &'static str) -> Self{
        Self {
            namespace,
            redis
        }
    }
    pub async fn get<T: FromRedisValue>(&mut self, key: &str) -> Result<T> {
        let result: T = self.redis.get(self.key(key)).await?;
        Ok(result)
    }

    pub async fn set<T: ToRedisArgs + Send + Sync>(&mut self, key: &str, value: T) -> Result<()> {
        self.redis.set(self.key(key), value).await?;
        Ok(())
    }

    pub async fn set_expire<T: ToRedisArgs + Send + Sync>(&mut self, key: &str, value: T, seconds: usize) -> Result<()> {
        self.redis.set(self.key(key), value).await?;
        self.redis.expire(self.key(key), seconds).await?;
        Ok(())
    }

    fn key(&self, key: &str) -> String {
        format!("{}:{}", self.namespace, key)
    }
}