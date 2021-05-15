use async_trait::async_trait;

use std::collections::HashMap;

use model::{RedisCache};
use serde::{Deserialize};
use super::{RankProvider, Score};


#[derive(Deserialize)]
struct GenFood {
    x: i32,
    y: i32,
    score: i32,
}
#[derive(Deserialize)]
struct Eat {
    x: i32,
    y: i32,
    food: String,
}

#[derive(Deserialize)]
struct InitialData {
    length: i32,
    seed: u32,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum GameEvent {
    GenFood(GenFood),
    Eat(Eat),
    Init(InitialData),
}

#[derive(Deserialize)]
struct Block {
    hash: String,
    time: i64,
    prev: String,
    data: GameEvent,
}

#[derive(Deserialize)]
pub struct SnakeRemakeScore {
    pub name: String,
    pub score: i64,
    data: Vec<Block>,
}

#[async_trait]
impl Score for SnakeRemakeScore {
    fn name(&self) -> &str {
        &self.name
    }
    async fn validate(&self, redis: &RedisCache) -> Result<i64, &'static str> {
        match self.name.as_str() {
            "" => Err("Name should not be empty")?,
            name if name.len() > 32 => Err("Name too long")?,
            _ => (),
        }
        match self.score {
            x if x < 0 => Err("Invalid score")?,
            _ => (),
        }

        let mut blocks = HashMap::new();
        let mut total_score: i64 = 0;
        if self.data.len() <= 0 {
            Err("Invalid score")?
        }
        match &self.data[0].data {
            GameEvent::Init(data) => total_score = data.length as i64,
            _ => Err("Invalid score")?,
        }
        
        let mut cache = redis.cache("rank");
        if let Some(_) = cache.get::<Option<i32>>(&self.data[0].hash).await.map_err(|_| "Internal error")? {
            Err("Invalid score")?
        } else {
            cache.set_expire(&self.data[0].hash, 1, 86400)
                .await
                .map_err(|_| "Internal error")?;
        }
        blocks.insert(self.data[0].hash.clone(), &self.data[0]);

        for block in self.data.iter().skip(1) {
            if !blocks.contains_key(&block.prev) {
                Err("Invalid score")?;
            }
            blocks.insert(block.hash.clone(), block);

            match &block.data {
                GameEvent::Eat(data) => {
                    let score = match blocks.get(&data.food) {
                        Some(food) => match &food.data {
                            GameEvent::GenFood(food) => match food.score {
                                0 | 1 | 3 => food.score,
                                _ => Err("Invalid score")?,
                            },
                            _ => Err("Invalid score")?,
                        },
                        _ => Err("Invalid score")?,
                    };
                    total_score += score as i64;
                }
                _ => (),
            }
        }

        if total_score != self.score {
            Err("Invalid score")?;
        }

        Ok(total_score)
    }
}

pub struct SnakeRemakeRank;
impl RankProvider<SnakeRemakeScore> for SnakeRemakeRank {
    fn rank_key() -> &'static str {
        "snake-remake"
    }
}