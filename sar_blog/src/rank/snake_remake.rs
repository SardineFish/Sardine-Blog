
use std::collections::HashMap;

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
    seed: u64,
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
    name: String,
    score: i64,
    data: Vec<Block>,
}

impl Score for SnakeRemakeScore {
    fn name(&self) -> &str {
        &self.name
    }
    fn validate(&self) -> Option<i64> {
        let mut blocks = HashMap::new();
        let mut total_score: i64;
        if self.data.len() <= 0 {
            return None;
        }
        match &self.data[0].data {
            GameEvent::Init(data) => total_score = data.length as i64,
            _ => return None,
        }
        blocks.insert(self.data[0].hash.clone(), &self.data[0]);

        for block in self.data.iter().skip(1) {
            if !blocks.contains_key(&block.prev) {
                return None;
            }
            blocks.insert(block.hash.clone(), block);

            match &block.data {
                GameEvent::Eat(data) => {
                    let score = match blocks.get(&data.food) {
                        Some(food) => match &food.data {
                            GameEvent::GenFood(food) => food.score,
                            _ => return None,
                        },
                        _ => return None,
                    };
                    total_score += score as i64;
                }
                _ => (),
            }
        }

        if total_score != self.score {
            return None;
        }

        Some(total_score)
    }
}

pub struct SnakeRemakeRank;
impl RankProvider<SnakeRemakeScore> for SnakeRemakeRank {
    fn rank_key() -> &'static str {
        "snake-remake"
    }
}