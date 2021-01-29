use model::{Model, User};
use serde::{Serialize, Deserialize};
use crate::error::*;

#[derive(Clone, Serialize, Deserialize)]
pub struct AnonymousUserInfo {
    pub name: String,
    pub email: Option<String>,
    pub url: Option<String>,
    pub avatar: Option<String>,
}

pub struct UserService<'m> {
    model: &'m Model
}

impl<'m> UserService<'m> {
    pub fn new(model: &'m Model) -> Self{
        Self{
            model
        }
    }

    pub async fn get_anonymous(&self, info: &AnonymousUserInfo) -> Result<User> {
        
    }
}