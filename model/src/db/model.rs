use std::time::Duration;

use mongodb::{self, Database, options::ClientOptions};
use options::ServiceOptions;
use crate::{comment::CommentModel, error::*, history::HistoryModel, post::PostModel, user::UserModel};

use super::storage::StorageModel;

pub type PidType = i32;

#[derive(Clone)]
pub struct Model
{
    db: Database,
    pub user: UserModel,
    pub comment: CommentModel,
    pub post: PostModel,
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
            history: HistoryModel::new(&db),
            db,
        })
    }

    pub async fn init(&self) -> Result<()> {
        self.post.init_meta().await?;
        Ok(())
    }
    pub fn storage(&self) -> StorageModel {
        StorageModel::new(&self.db)
    }
}