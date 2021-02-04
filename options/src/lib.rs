use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceOptions {
    pub listen: String,
    pub db_addr: String,
    pub db_name: String,
    pub db_timeout: u64,
    pub redis_addr: String,
    pub default_avatar: String,
}

impl Default for ServiceOptions {
    fn default() -> Self {
        Self {
            listen: "localhost:3000".to_string(),
            db_addr: "mongo://localhost".to_string(),
            db_name: "sar_blog".to_string(),
            db_timeout: 100,
            redis_addr: "redis://localhost".to_string(),
            default_avatar: "/img/decoration/unknown-user.png".to_string(),
        }
    }
}