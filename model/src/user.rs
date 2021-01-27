use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub enum HashMethod {
    SHA256,
}

#[derive(Serialize, Deserialize)]
pub struct User {
    pub uid: String,
    pub name: String,
    pub email: String,
    pub avatar: String,
    pub url: String,
    pub password_hash: String,
    pub salt: String,
    pub method: HashMethod,
}