mod json_duration_format;
use serde::{Serialize, Deserialize};
use chrono::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceOptions {
    pub listen: String,
    pub db_addr: String,
    pub db_name: String,
    pub db_timeout: u64,
    pub redis_addr: String,
    pub default_avatar: String,
    #[serde(with="json_duration_format")]
    pub visit_expire_time: Duration,
    #[serde(with="json_duration_format")]
    pub session_expire: Duration,
    #[serde(with="json_duration_format")]
    pub challenge_expire: Duration,
    pub web_root: String,
}

impl Default for ServiceOptions {
    fn default() -> Self {
        Self {
            listen: "localhost:3000".to_string(),
            db_addr: "mongodb://localhost".to_string(),
            db_name: "sar_blog".to_string(),
            db_timeout: 100,
            redis_addr: "redis://localhost".to_string(),
            default_avatar: "/img/decoration/unknown-user.png".to_string(),
            visit_expire_time: Duration::days(1),
            session_expire: Duration::weeks(1), 
            challenge_expire: Duration::hours(1),
            web_root: "./web-root".to_owned(),
        }
    }
}