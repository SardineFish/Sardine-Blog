use chrono::{DateTime, TimeZone, Utc};
use redis::{AsyncCommands, FromRedisValue, ToRedisArgs, aio::MultiplexedConnection};
use crate::{PidType, error::*};

use super::redis::namespace_key;

pub type SessionID = String;

pub struct SessionAuthInfo {
    pub token: String,
    pub uid: String,
    pub salt: String,
}

pub struct SessionData {
    pub last_active: DateTime<Utc>,
    pub auth_info: SessionAuthInfo,
}

const NAMESPACE_DATA: &str = "session";
const NAMESPACE_VISITS: &str = "visit";

const KEY_LAST_ACTIVE: &str = "last_active";
const KEY_ACCESS_TOKEN: &str = "access_token";
const KEY_UID: &str = "uid";
const KEY_SALT: &str = "salt";

pub struct Session<'s> {
    pub session_id: &'s SessionID,
    redis: MultiplexedConnection,
    key_data: String,
    key_visit: String,
}

impl<'s> Session<'s> {
    pub fn with_session_id(session_id: &'s SessionID, redis: MultiplexedConnection) -> Self {
        Self{
            redis,
            key_data: namespace_key(NAMESPACE_DATA, &session_id),
            key_visit: namespace_key(NAMESPACE_VISITS, &session_id),
            session_id,
        }
    }
    pub async fn last_active(&mut self) -> Result<Option<DateTime<Utc>>> {
        let timestamp: Option<i64> = self.get_field::<Option<i64>>(KEY_LAST_ACTIVE).await?;

        Ok(timestamp.map(|timestamp| Utc.timestamp_millis(timestamp)))
    }
    pub async fn set_last_active(&mut self, time: &DateTime<Utc>) -> Result<()> {
        let timestamp = time.timestamp_millis();
        self.set_field(KEY_LAST_ACTIVE, timestamp).await
    }

    pub async fn access_token(&mut self) -> Result<Option<String>> {
        self.get_field(KEY_ACCESS_TOKEN).await
    }

    pub async fn set_access_token(&mut self, value: &str) -> Result<()> {
        self.set_field(KEY_ACCESS_TOKEN, value).await
    }

    pub async fn uid(&mut self)->Result<Option<String>> {
        self.get_field(KEY_UID).await
    }
    pub async fn set_uid(&mut self, value: &str) -> Result<()> {
        self.set_field(KEY_UID, value).await
    }

    pub async fn salt(&mut self) -> Result<Option<String>> {
        self.get_field(KEY_SALT).await
    }
    pub async fn set_salt(&mut self, value: &str) -> Result<()> {
        self.set_field(KEY_SALT, value).await
    }

    pub async fn get(&mut self) -> Result<Option<SessionData>> {
        let (timestamp, token, uid, salt): (Option<i64>, Option<String>, Option<String>, Option<String>) = self.redis.hget(&self.key_data, 
            &[KEY_LAST_ACTIVE, KEY_ACCESS_TOKEN, KEY_UID, KEY_SALT])
            .await
            .map_model_result()?;

        if let (Some(timestamp), Some(token), Some(uid), Some(salt)) = (timestamp, token, uid, salt) {
            Ok(Some(SessionData {
                last_active: Utc.timestamp_millis(timestamp),
                auth_info: SessionAuthInfo {
                    uid,
                    token,
                    salt,
                }
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn set(&mut self, data: &SessionData) -> Result<()> {
        let timestamp = data.last_active.timestamp_millis();
        redis::cmd("HSET")
            .arg(&self.key_data)
            .arg(KEY_LAST_ACTIVE).arg(timestamp)
            .arg(KEY_ACCESS_TOKEN).arg(&data.auth_info.token)
            .arg(KEY_UID).arg(&data.auth_info.uid)
            .query_async(&mut self.redis)
            .await
            .map_model_result()
    }

    pub async fn add_visit(&mut self, pid: PidType) -> Result<bool> {
        self.redis.sadd(&self.key_visit, pid)
            .await
            .map_model_result()
    }

    pub async fn check_visit(&mut self, pid: PidType) -> Result<bool> {
        self.redis.sismember(&self.key_visit, pid)
            .await
            .map_model_result()
    }

    pub async fn reset_visit(&mut self) -> Result<()> {
        self.redis.del(&self.key_visit)
            .await
            .map_model_result()
    }

    async fn get_field<T: FromRedisValue>(&mut self, field: &str) -> Result<T> {
        self.redis.hget(&self.key_data, field)
            .await
            .map_model_result()
    }

    async fn set_field<T : ToRedisArgs + Send + Sync>(&mut self, field: &str, value: T) -> Result<()> {
        self.redis.hset(&self.key_data, field, value)
            .await
            .map_model_result()?;
        Ok(())
    }
}