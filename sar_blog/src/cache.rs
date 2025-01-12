use std::{future::Future, marker::PhantomData};

use serde::{de::DeserializeOwned, Serialize};
use shared::LogError;

use crate::Service;

pub mod cache_namespaces {
    pub const FEED: &str = "feed";
    pub const SEAERCH: &str = "search";
    pub const THROTTLE: &str = "throttle";
    // There are other namespaces defined in model/src/redis/session.rs
}

pub struct CacheService<'s> {
    service: &'s Service,
}

impl<'s> CacheService<'s> {
    pub fn new(service: &'s Service) -> Self {
        Self { service }
    }

    pub async fn with_cache<
        T: Serialize + DeserializeOwned,
        E,
        Fut: Future<Output = Result<T, E>>,
    >(
        &self,
        namespace: &'static str,
        key: &str,
        create_if_miss: impl FnOnce() -> Fut,
    ) -> Result<T, E> {
        let mut cache = self.service.redis.cache(namespace);
        if let Ok(Some(json)) = cache.get::<Option<String>>(key).await {
            if let Ok(value) = serde_json::from_str::<T>(&json) {
                log::info!("Cache hit {namespace}:{key}");
                return Ok(value);
            }
        }

        log::info!("Cache miss {namespace}:{key}");
        let data = create_if_miss().await;
        if let Ok(data) = &data {
            if let Ok(json) = serde_json::to_string(&data).log_error("cache") {
                cache.set(key, json).await.log_error_consume("cache");
            }
        }
        data
    }

    pub async fn with_cache_expire<
        T: Serialize + DeserializeOwned,
        E,
        Fut: Future<Output = Result<T, E>>,
    >(
        &self,
        namespace: &'static str,
        key: &str,
        expire_seconds: usize,
        create_if_miss: impl FnOnce() -> Fut,
    ) -> Result<T, E> {
        let mut cache = self.service.redis.cache(namespace);
        if let Ok(Some(json)) = cache.get::<Option<String>>(key).await {
            if let Ok(value) = serde_json::from_str::<T>(&json) {
                log::info!("Cache hit {namespace}:{key}");
                return Ok(value);
            }
        }
        log::info!("Cache miss {namespace}:{key}");
        let data = create_if_miss().await;
        if let Ok(data) = &data {
            if let Ok(json) = serde_json::to_string(&data).log_error("cache") {
                cache
                    .set_expire(key, json, expire_seconds)
                    .await
                    .log_error_consume("cache");
            }
        }
        data
    }

    pub async fn flush(&self, namespace: &'static str, key: &str) -> bool {
        self.service
            .redis
            .cache(namespace)
            .flush(key)
            .await
            .log_error("cache")
            .unwrap_or(false)
    }

    pub async fn flush_namespace(&self, namespace: &'static str) -> usize {
        self.service
            .redis
            .cache(namespace)
            .flush_all()
            .await
            .log_error("cache")
            .unwrap_or(0)
    }

    pub async fn json<'a, T: Serialize + DeserializeOwned>(
        &self,
        namespace: &'static str,
        key: &'a str,
    ) -> JsonCacheHandler<'a, T> {
        JsonCacheHandler {
            cache: self.service.redis.cache(namespace),
            key,
            phantom: Default::default(),
        }
    }
}

pub struct JsonCacheHandler<'s, T> {
    cache: model::GenericCache,
    key: &'s str,
    phantom: PhantomData<T>,
}

impl<T: Serialize + DeserializeOwned> JsonCacheHandler<'_, T> {
    pub async fn get(&mut self) -> Option<T> {
        if let Ok(Some(json)) = self.cache.get::<Option<String>>(self.key).await {
            if let Ok(value) = serde_json::from_str::<T>(&json) {
                return Some(value);
            }
        }
        None
    }

    pub async fn set(&mut self, data: &T) {
        if let Ok(json) = serde_json::to_string(&data).log_error("cache") {
            self.cache
                .set(self.key, json)
                .await
                .log_error_consume("cache");
        }
    }

    pub async fn set_expire(&mut self, data: T, expire_seconds: usize) {
        if let Ok(json) = serde_json::to_string(&data).log_error("cache") {
            self.cache
                .set_expire(self.key, json, expire_seconds)
                .await
                .log_error_consume("cache");
        }
    }
}
