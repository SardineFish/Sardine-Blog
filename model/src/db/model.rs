use std::time::Duration;

use mongodb::{self, options::ClientOptions};
use crate::{comment::CommentModel, error::*, history::HistoryModel, post::PostModel, post_data::PostDataModel, user::UserModel};

pub type PidType = u32;

pub struct DBOptions {
    pub addr: String,
    pub db_name: String,
    pub timeout_ms: u64,
}

impl Default for DBOptions {
    fn default() -> Self {
        Self {
            addr: "mongodb://localhost".to_string(),
            db_name: "sar_blog".to_string(),
            timeout_ms: 100,
        }
    }
}

pub struct Model
{
    pub user: UserModel,
    pub comment: CommentModel,
    pub post: PostModel,
    pub post_data: PostDataModel,
    pub history: HistoryModel,
}

impl Model 
{
    pub async fn open(options: DBOptions) -> Result<Self> {
        let mut opt = ClientOptions::parse(&options.addr)
            .await
            .map_model_result()?;
        opt.connect_timeout = Some(Duration::from_millis(options.timeout_ms));
        opt.server_selection_timeout = Some(Duration::from_millis(options.timeout_ms));

        let client = mongodb::Client::with_options(opt)
            .map_model_result()?;

        let db = client.database(&options.db_name);
        
        Ok(Model{
            user: UserModel::new(&db),
            post: PostModel::new(&db),
            comment: CommentModel::new(&db),
            post_data: PostDataModel::new(&db),
            history: HistoryModel::new(&db)
        })
    }
}