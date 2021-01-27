use std::time::Duration;

use mongodb::{self, options::ClientOptions};
use crate::{comment::CommentModel, error::*, post::PostModel, post_data::PostDataModel};

pub type PidType = u32;

pub struct Model
{
    pub comment: CommentModel,
    pub post: PostModel,
    pub post_data: PostDataModel,
}

impl Model 
{
    pub async fn new(db_addr: &str, db_name: &str, db_timeout: u64) -> Result<Model>
    {
        let mut option = ClientOptions::parse(db_addr)
            .await
            .map_model_result()?;
        option.connect_timeout = Some(Duration::from_millis(db_timeout));
        option.server_selection_timeout = Some(Duration::from_millis(db_timeout));

        let client = mongodb::Client::with_options(option)
            .map_model_result()?;

        let db = client.database(db_name);
        
        Ok(Model{
            post: PostModel::new(&db),
            comment: CommentModel::new(&db),
            post_data: PostDataModel::new(&db)
        })
    }
}