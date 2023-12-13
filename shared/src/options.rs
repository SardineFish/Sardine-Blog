use crate::json_duration_format;
use chrono::Duration;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceOptions {
    pub listen: String,
    pub workers: usize,
    pub db_addr: String,
    pub db_name: String,
    pub db_timeout: u64,
    pub redis_addr: String,
    pub db_init: bool,
    pub site_url: String,
    pub default_avatar: String,
    #[serde(with = "json_duration_format")]
    pub visit_expire_time: Duration,
    #[serde(with = "json_duration_format")]
    pub session_expire: Duration,
    #[serde(with = "json_duration_format")]
    pub challenge_expire: Duration,
    pub web_root: String,
    pub qiniu_accesskey: String,
    pub qiniu_secretkey: String,
    pub sar_push_url: String,
    pub sar_push_uid: String,
    pub sar_push_secret: String,
    pub message_board_notify: String,
    pub report_address: String,
    #[serde(with = "json_duration_format")]
    pub report_interval: Duration,
    pub enable_indexing: bool,
    pub elastic_url: String,
}

impl Default for ServiceOptions {
    fn default() -> Self {
        Self {
            listen: "localhost:3000".to_string(),
            workers: 8,
            db_addr: "mongodb://localhost".to_string(),
            db_name: "sar_blog".to_string(),
            db_timeout: 100,
            db_init: false,
            redis_addr: "redis://localhost".to_string(),
            site_url: "http://localhost:3000".to_owned(),
            default_avatar: "/img/decoration/unknown-user.png".to_string(),
            visit_expire_time: Duration::days(1),
            session_expire: Duration::weeks(1),
            challenge_expire: Duration::hours(1),
            web_root: "./web-root".to_owned(),
            qiniu_accesskey: "_Z9zEXWg4gXN4hsJeu77VQdFYrAKzCKCatZVIoq3".to_owned(),
            qiniu_secretkey: "O9hEQhX47e4gIwYltHdyKE7xUGCP6krv5e7z71Bn".to_owned(),
            sar_push_url: "http://localhost:5000".to_owned(),
            sar_push_uid: "602d2f910036e412005537f4".to_owned(),
            sar_push_secret: "b6/GP8IAuMVU3u2FxPHz9YPKvTcPRIU8K1NrHFq35Yo=".to_owned(),
            message_board_notify: "me@sardinefish.com".to_owned(),
            report_address: "me@sardinefish.com".to_owned(),
            report_interval: Duration::minutes(5),
            enable_indexing: false,
            elastic_url: "http://localhost:9200".to_owned(),
        }
    }
}
