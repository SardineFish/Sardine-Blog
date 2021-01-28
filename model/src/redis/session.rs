use chrono::{DateTime, TimeZone, Utc};
use redis::{AsyncCommands, FromRedisValue, ToRedisArgs, aio::MultiplexedConnection};
use crate::error::*;

use super::redis::namespace_key;

pub type SessionID = String;

pub struct SessionData {
    last_active: DateTime<Utc>,
    access_token: String,
    uid: String,
}

const NAMESPACE: &str = "session";
const KEY_LAST_ACTIVE: &str = "last_active";
const KEY_ACCESS_TOKEN: &str = "access_token";
const KEY_UID: &str = "uid";

pub struct Session {
    pub session_id: SessionID,
    redis: MultiplexedConnection,
    key: String,
}

impl Session {
    pub fn with_session_id(session_id: SessionID, redis: MultiplexedConnection) -> Self {
        Self{
            redis,
            key: namespace_key(NAMESPACE, &session_id),
            session_id,
        }
    }
    pub async fn last_active(&mut self) -> Result<DateTime<Utc>> {
        let timestamp = self.get_field(KEY_LAST_ACTIVE).await?;

        Ok(Utc.timestamp_millis(timestamp))
    }
    pub async fn set_last_active(&mut self, time: &DateTime<Utc>) -> Result<()> {
        let timestamp = time.timestamp_millis();
        self.set_field(KEY_LAST_ACTIVE, timestamp).await
    }

    pub async fn access_token(&mut self) -> Result<String> {
        self.get_field(KEY_ACCESS_TOKEN).await
    }

    pub async fn set_access_token(&mut self, value: &str) -> Result<()> {
        self.set_field(KEY_ACCESS_TOKEN, value).await
    }

    pub async fn uid(&mut self)->Result<String> {
        self.get_field(KEY_UID).await
    }
    pub async fn set_uid(&mut self, value: &str) -> Result<()> {
        self.set_field(KEY_UID, value).await
    }

    pub async fn get(&mut self) -> Result<SessionData> {
        let (timestamp, token, uid): (i64, String, String) = self.redis.hget(&self.key, 
            &[KEY_LAST_ACTIVE, KEY_ACCESS_TOKEN, KEY_UID])
            .await
            .map_model_result()?;
        
        Ok(SessionData {
            last_active: Utc.timestamp_millis(timestamp),
            access_token: token,
            uid
        })
    }

    pub async fn set(&mut self, data: &SessionData) -> Result<()> {
        let timestamp = data.last_active.timestamp_millis();
        redis::cmd("HSET")
            .arg(&self.key)
            .arg(KEY_LAST_ACTIVE).arg(timestamp)
            .arg(KEY_ACCESS_TOKEN).arg(&data.access_token)
            .arg(KEY_UID).arg(&data.uid)
            .query_async(&mut self.redis)
            .await
            .map_model_result()
    }

    async fn get_field<T: FromRedisValue>(&mut self, field: &str) -> Result<T> {
        self.redis.hget(&self.key, field)
            .await
            .map_model_result()
    }

    async fn set_field<T : ToRedisArgs + Send + Sync>(&mut self, field: &str, value: T) -> Result<()> {
        self.redis.hset(&self.key, field, value)
            .await
            .map_model_result()?;
        Ok(())
    }
}