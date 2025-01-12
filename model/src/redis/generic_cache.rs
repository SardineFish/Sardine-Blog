use crate::error::Result;
use futures::StreamExt;
use redis::{aio::MultiplexedConnection, FromRedisValue, ToRedisArgs};
use redis::AsyncCommands;

pub struct GenericCache {
    namespace: &'static str,
    redis: MultiplexedConnection,
}

impl GenericCache {
    pub fn new(redis: MultiplexedConnection, namespace: &'static str) -> Self {
        Self { namespace, redis }
    }
    pub async fn get<T: FromRedisValue>(&mut self, key: &str) -> Result<T> {
        let result: T = self.redis.get(self.key(key)).await?;
        Ok(result)
    }

    pub async fn set<T: ToRedisArgs + Send + Sync>(&mut self, key: &str, value: T) -> Result<()> {
        self.redis.set(self.key(key), value).await?;
        Ok(())
    }

    pub async fn set_expire<T: ToRedisArgs + Send + Sync>(
        &mut self,
        key: &str,
        value: T,
        seconds: usize,
    ) -> Result<()> {
        self.redis.set(self.key(key), value).await?;
        self.redis.expire(self.key(key), seconds).await?;
        Ok(())
    }

    pub async fn flush(&mut self, key: &str) -> Result<bool> {
        let result: usize = self.redis.del(self.key(key)).await?;

        Ok(result > 0)
    }

    pub async fn flush_all(&mut self) -> Result<usize> {
        let pattern = self.key("*");

        let mut total_count = 0usize;
        let keys = self
            .redis
            .scan_match(&pattern)
            .await?
            .collect::<Vec<String>>()
            .await;

        for key in keys {
            let count: usize = self
                .redis
                .del(&key)
                .await
                .inspect_err(|err| {
                    log::error!("Failed to delete redis cache {key}: {err}");
                })
                .unwrap_or(0);

            total_count += count;
        }

        Ok(total_count)
    }

    fn key(&self, key: &str) -> String {
        format!("{}:{}", self.namespace, key)
    }
}
