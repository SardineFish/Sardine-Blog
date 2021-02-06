use serde::{self, Deserialize, Deserializer, Serializer};

pub fn serialize<S>(value: &usize, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_i64(*value as i64)
}

pub fn deserialize<'de, D>(deserializer: D) -> Result<usize, D::Error>
where
    D: Deserializer<'de>,
{
    Ok(i64::deserialize(deserializer)? as usize)
}
