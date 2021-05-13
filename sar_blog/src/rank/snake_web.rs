use super::{RankProvider, SimpleScore};

pub struct SnakeWebRank;

impl RankProvider<SimpleScore> for SnakeWebRank {
    fn rank_key() -> &'static str {
        "snakeWeb"
    }
}