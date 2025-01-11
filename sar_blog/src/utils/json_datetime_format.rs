use chrono::{DateTime, LocalResult, TimeZone, Utc};
use serde::{self, Deserialize, Deserializer, Serializer};

pub fn serialize<S>(time: &DateTime<Utc>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_i64(time.timestamp_millis())
}

pub fn deserialize<'de, D>(deserializer: D) -> Result<DateTime<Utc>, D::Error>
where
    D: Deserializer<'de>,
{
    let timestamp = i64::deserialize(deserializer)?;
    match Utc.timestamp_millis_opt(timestamp) {
        LocalResult::Single(time) => Ok(time),
        _ => Err(<D::Error as serde::de::Error>::custom("Invalid timestamp")),
    }
}
