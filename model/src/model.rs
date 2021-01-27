use std::time::Duration;

use mongodb::{self, options::ClientOptions};
use crate::error::*;
use super::{blog::BlogModel};

pub type PidType = u32;

pub struct Model
{
    pub blog: super::blog::BlogModel,

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
            blog: BlogModel::new(&db)
        })
    }
}