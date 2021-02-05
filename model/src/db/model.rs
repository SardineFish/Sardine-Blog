use std::time::Duration;

use mongodb::{self, options::ClientOptions};
use options::ServiceOptions;
use crate::{comment::CommentModel, error::*, history::HistoryModel, post::PostModel, post_data::PostDataModel, user::UserModel};

pub type PidType = u32;

#[derive(Clone)]
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
    pub async fn open(options: &ServiceOptions) -> Result<Self> {
        let mut opt = ClientOptions::parse(&options.db_addr)
            .await
            .map_model_result()?;
        opt.connect_timeout = Some(Duration::from_millis(options.db_timeout));
        opt.server_selection_timeout = Some(Duration::from_millis(options.db_timeout));

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