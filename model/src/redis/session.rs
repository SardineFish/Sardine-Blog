
use chrono::{DateTime, TimeZone, Utc};
use redis::{AsyncCommands, FromRedisValue, RedisError, ToRedisArgs, aio::MultiplexedConnection, pipe};
use paste::paste;

use crate::{PidType, error::*};

use super::redis::namespace_key;

pub type SessionID = String;

pub struct SessionAuthInfo {
    pub token: String,
    pub uid: String,
}

pub struct SessionData {
    pub last_active: DateTime<Utc>,
    pub auth_info: SessionAuthInfo,
}

const NAMESPACE_DATA: &str = "session";
const NAMESPACE_VISITS: &str = "visit";
const NAMESPACE_LIKED: &str = "liked";
const NAMESPACE_CHALLENGE: &str = "challenge";

const KEY_LAST_ACTIVE: &str = "last_active";
const KEY_ACCESS_TOKEN: &str = "access_token";
const KEY_UID: &str = "uid";
const KEY_FAKE_SALT: &str = "fake_salt";


macro_rules! ref_type {
    (String) => {&str};
    ($type: ident) => {&$type};
}

macro_rules! session_field {
    ($type: ident, $name: ident, $key: ident) => {
        paste! {

            pub async fn $name(&mut self) -> Result<Option<$type>> {
                self.get_field($key).await
            }
            pub async fn [<set_ $name>](&mut self, value: ref_type!($type)) -> Result<()> {
                self.set_field($key, value).await
            }
        }
    };
}

pub struct Session<'s> {
    pub session_id: &'s str,
    redis: MultiplexedConnection,
    key_data: String,
    key_visit: String,
}

impl<'s> Session<'s> {
    pub fn with_session_id(session_id: &'s str, redis: MultiplexedConnection) -> Self {
        Self{
            redis,
            key_data: namespace_key(NAMESPACE_DATA, &session_id),
            key_visit: namespace_key(NAMESPACE_VISITS, &session_id),
            session_id,
        }
    }
    pub async fn exists(&mut self) -> Result<bool> {
        self.redis.exists(&self.key_data).await.map_model_result()
    }
    pub async fn try_init(&mut self) -> Result<bool> {
        let keys = &[&self.key_data, &self.key_visit];
        redis::cmd("WATCH").arg(keys).query_async(&mut self.redis).await.map_model_result()?;
        let mut p = redis::pipe();

        let existed: bool = self.redis.exists(&self.key_data).await.map_model_result()?;
        if existed {
            redis::cmd("UNWATCH").query_async(&mut self.redis).await.map_model_result()?;
            Ok(false)
        } else {
            let result: std::result::Result<(), RedisError> = p.atomic()
                .hset(&self.key_data, KEY_LAST_ACTIVE, Utc::now().timestamp_millis())
                .del(&self.key_visit)
                .query_async(&mut self.redis)
                .await;

            if let Err(err) = result {
                redis::cmd("UNWATCH").query_async(&mut self.redis).await.map_model_result()?;
                Err(err).map_model_result()
            } else {
                Ok(true)
            }
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

    pub async fn delete(&mut self) -> Result<()> {
        pipe()
            .del(&self.key_data).ignore()
            .del(&self.key_visit).ignore()
            .query_async(&mut self.redis)
            .await
            .map_model_result()
    }

    pub async fn use_challenge(&mut self) -> Result<Option<String>> {
        let key = namespace_key(NAMESPACE_CHALLENGE, self.session_id);
        let (challenge, ): (Option<String>, ) = pipe()
            .get(&key)
            .del(&key).ignore()
            .query_async(&mut self.redis)
            .await
            .map_model_result()?;
        Ok(challenge)
    }

    pub async fn set_challenge(&mut self, value: &str, expire: usize) -> Result<()> {
        let key = namespace_key(NAMESPACE_CHALLENGE, self.session_id);
        pipe()
            .set(&key, value)
            .expire(&key, expire)
            .query_async(&mut self.redis)
            .await
            .map_model_result()

    }
    session_field!(String, uid, KEY_UID);

    session_field!(String, fake_salt, KEY_FAKE_SALT);

    pub async fn get(&mut self) -> Result<Option<SessionData>> {
        let (timestamp, token, uid): (Option<i64>, Option<String>, Option<String>) = self.redis.hget(&self.key_data, 
            &[KEY_LAST_ACTIVE, KEY_ACCESS_TOKEN, KEY_UID])
            .await
            .map_model_result()?;

        if let (Some(timestamp), Some(token), Some(uid)) = (timestamp, token, uid) {
            Ok(Some(SessionData {
                last_active: Utc.timestamp_millis(timestamp),
                auth_info: SessionAuthInfo {
                    uid,
                    token,
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

    pub async fn add_visit(&mut self, pid: PidType, expire_seconds: usize) -> Result<bool> {
        let not_visited: bool = self.redis.sadd(&self.key_visit, pid)
            .await
            .map_model_result()?;
        
        self.redis.expire(&self.key_visit, expire_seconds).await.map_model_result()?;
        Ok(not_visited)
    }

    pub async fn check_visit(&mut self, pid: PidType) -> Result<bool> {
        self.redis.sismember(&self.key_visit, pid)
            .await
            .map_model_result()
    }

    pub async fn add_like(&mut self, pid: PidType, expire_seconds: usize) -> Result<bool> {
        let key = namespace_key(NAMESPACE_LIKED, &self.session_id);
        let (result,): (bool,) = pipe()
            .sadd(&key, pid)
            .expire(&key, expire_seconds).ignore()
            .query_async(&mut self.redis)
            .await
            .map_model_result()?;
        Ok(result)
    }

    pub async fn remove_like(&mut self, pid: PidType, expire_seconds: usize) -> Result<bool> {
        let key = namespace_key(NAMESPACE_LIKED, &self.session_id);
        let (result,): (bool, ) = pipe()
            .srem(&key, pid)
            .expire(&key, expire_seconds).ignore()
            .query_async(&mut self.redis)
            .await
            .map_model_result()?;
        Ok(result)
    }


    // pub async fn reset_visit(&mut self) -> Result<()> {
    //     self.redis.del(&self.key_visit)
    //         .await
    //         .map_model_result()
    // }

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