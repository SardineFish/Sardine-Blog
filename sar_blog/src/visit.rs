use model::{Model, PidType, Post, RedisCache, SessionID};
use serde::de::DeserializeOwned;

use crate::error::*;

pub async fn update_visit_count<T: Post + DeserializeOwned>(model: &Model, redis: &RedisCache, post: &T, session_id: &SessionID) -> Result<usize> {
    let not_visited = redis.session(session_id).add_visit(post.pid())
        .await
        .map_service_err()?;
    
    if not_visited {
        model.post.view::<T>(post.pid()).await.map_service_err()
    } else {
        Ok(post.stats().views)
    }
}