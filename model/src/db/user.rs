use bson::Document;
use mongodb::{Collection, Database, bson::{self, doc}, options::FindOneAndUpdateOptions};
use serde::{Serialize, Deserialize};

use crate::error::*;

const COLLECTION_USER: &str = "user";

#[derive(Serialize, Deserialize, Clone)]
pub enum HashMethod {
    SHA256,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AuthenticationInfo {
    pub password_hash: String,
    pub salt: String,
    pub method: HashMethod,
}
#[derive(Serialize, Deserialize, Clone)]
pub struct UserInfo{
    pub email: String,
    pub name: String,
    pub url: String,
    pub avatar: String,
}

#[derive(Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord, Clone)]
pub enum Access {
    Root = 32,
    Owner = 16,
    Trusted = 18,
    Registered = 4,
    Anonymous = 2,
    Visitor = 1,
    Forbidden = 0,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct User {
    pub uid: String,
    pub access: Access,
    pub info: UserInfo,
    pub auth_info: AuthenticationInfo,
}

pub struct UserModel {
    collection: Collection,
}

impl UserModel {
    pub fn new(db: &Database) -> Self {
        Self{
            collection: db.collection(COLLECTION_USER),
        }
    }

    pub async fn get_by_uid(&self, uid: &str) -> Result<User> {
        let query = doc! {
            "uid": uid,
        };
        self.query_user(query).await?.ok_or(Error::UserNotFound(uid.to_string()))
    }

    pub async fn get_by_email(&self, email: &str) -> Result<User> {
        let query = doc! {
            "email": email,
        };
        self.query_user(query).await?.ok_or(Error::UserNotFound(email.to_string()))
    }

    pub async fn update_password(&self, uid: &str, auth_info: AuthenticationInfo) -> Result<User> {
        self.update_and_query(uid, "auth_info", auth_info).await
    }

    pub async fn update_info(&self, uid: &str, user_info: UserInfo) -> Result<User> {
        self.update_and_query(uid, "info", user_info).await
    }

    pub async fn grant_access(&self, uid: &str, access: Access) -> Result<User> {
        self.update_and_query(uid, "access", access).await
    }

    async fn query_user(&self, query: Document) -> Result<Option<User>> {
        let doc = self.collection.find_one(query, None)
            .await
            .map_model_result()?;
        if let Some(doc) = doc {
            bson::from_document(doc).map_model_result()
        }else {
            Ok(None)
        }
    }

    async fn update_and_query<T: Serialize>(&self, uid: &str, key: &str, update: T) -> Result<User> {
        let query = doc! {
            "uid": uid,
        };
        let update = doc!{
            "$set": {
                key: bson::to_bson(&update).unwrap()
            }
        };
        let mut options = FindOneAndUpdateOptions::default();
        options.return_document = Some(mongodb::options::ReturnDocument::After);
        let doc = self.collection.find_one_and_update(query, update, options)
            .await
            .map_model_result()?
            .ok_or(Error::UserNotFound(uid.to_string()))?;

        bson::from_document(doc).map_model_result()
    }
}