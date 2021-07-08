#[derive(serde::Deserialize)]
pub struct Config {
    pub mysql_url: String,
    pub reset_pid: bool,
    pub import_mysql: bool,
    pub import_blog: bool,
    pub import_note: bool,
    pub import_comment: bool,
    pub import_user: bool,
    pub import_stats: bool,
    pub import_score: bool,
    pub rebuild_search_index: bool,
}