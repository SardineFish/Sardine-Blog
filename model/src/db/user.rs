use bson::Document;
use mongodb::{
    bson::{self, doc},
    options::{FindOneAndUpdateOptions, UpdateOptions},
    Collection, Database,
};
use serde::{Deserialize, Serialize};
use shared::error::LogError;

use crate::error::*;

const COLLECTION_USER: &str = "user";

#[derive(Serialize, Deserialize, Clone)]
pub enum HashMethod {
    NoLogin,
    SHA256,
    SHA1,
    MD5,
    Plain,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AuthenticationInfo {
    pub password_hash: String,
    pub salt: String,
    pub method: HashMethod,
}
#[derive(Serialize, Deserialize, Clone)]
pub struct UserInfo {
    pub name: String,
    pub email: Option<String>,
    pub url: Option<String>,
    pub avatar: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PubUserInfo {
    pub name: String,
    pub avatar: String,
    pub url: Option<String>,
}

impl From<&User> for PubUserInfo {
    fn from(user: &User) -> Self {
        Self {
            name: user.info.name.clone(),
            avatar: user.info.avatar.clone(),
            url: user.info.url.clone(),
        }
    }
}

pub type AnonymousUserInfo = UserInfo;

#[derive(Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord, Clone, Copy)]
pub enum Access {
    Root = 32,
    Owner = 16,
    Trusted = 8,
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

impl User {
    pub fn registered_user(uid: &str, info: &UserInfo, auth: &AuthenticationInfo) -> Self {
        Self {
            uid: uid.to_string(),
            auth_info: auth.clone(),
            access: Access::Registered,
            info: info.clone(),
        }
    }

    pub fn root(auth: AuthenticationInfo) -> Self {
        Self {
            uid: "root".to_string(),
            auth_info: auth,
            access: Access::Root,
            info: UserInfo {
                name: "Root User".to_string(),
                email: None,
                url: None,
                avatar: String::default(),
            },
        }
    }

    pub fn anonymous(info: &AnonymousUserInfo) -> Self {
        let uid: String = if let Some(email) = &info.email {
            format!("{:x}", md5::compute(email))
        } else {
            format!("{:X}", md5::compute(&info.name))
        };

        Self {
            uid,
            info: info.clone(),
            access: Access::Anonymous,
            auth_info: AuthenticationInfo {
                method: HashMethod::NoLogin,
                salt: String::default(),
                password_hash: String::default(),
            },
        }
    }
}

#[derive(Clone)]
pub struct UserModel {
    collection: Collection<User>,
}

impl UserModel {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection(COLLECTION_USER),
        }
    }

    pub async fn init_collection(db: &Database) {
        db.run_command(
            doc! {
                "createIndexes": COLLECTION_USER,
                "indexes": [
                    {
                        "key": {
                            "uid": 1,
                        },
                        "name": "idx_uid",
                        "unique": true,
                    },
                ],
            },
            None,
        )
        .await
        .log_warn_consume("init-db-user");
    }

    pub async fn get_by_uid(&self, uid: &str) -> Result<User> {
        let query = doc! {
            "uid": uid,
        };
        self.query_user(query)
            .await?
            .ok_or_else(|| Error::UserNotFound(uid.to_string()))
    }

    pub async fn get_by_email(&self, email: &str) -> Result<User> {
        let query = doc! {
            "email": email,
        };
        self.query_user(query)
            .await?
            .ok_or_else(|| Error::UserNotFound(email.to_string()))
    }

    pub async fn add(&self, user: &User) -> Result<()> {
        let query = doc! {
            "uid": &user.uid
        };
        let update = doc! {
            "$setOnInsert": bson::to_bson(user).map_model_result()?
        };
        let mut opts = UpdateOptions::default();
        opts.upsert = Some(true);
        let result = self
            .collection
            .update_one(query, update, opts)
            .await
            .map_model_result()?;

        if result.upserted_id.is_none() {
            Err(Error::UserExisted(user.uid.to_string()))
        } else {
            Ok(())
        }
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

    pub async fn delete_email(&self, uid: &str) -> Result<User> {
        // let query = doc! {
        //     "uid": uid,
        // };
        // let update = doc! {
        //     "$unset": {
        //         "info.email": ""
        //     }
        // };
        // let result = self.collection.update_one(query, update, None).await?;
        // if result.matched_count <= 0 {
        //     Err(Error::UserNotFound(uid.to_owned()))
        // } else {
        //     Ok(())
        // }
        self.update_and_query(uid, "info.email", Option::<String>::None)
            .await
    }

    async fn query_user(&self, query: Document) -> Result<Option<User>> {
        self.collection
            .find_one(query, None)
            .await
            .map_model_result()
    }

    async fn update_and_query<T: Serialize>(
        &self,
        uid: &str,
        key: &str,
        update: T,
    ) -> Result<User> {
        let query = doc! {
            "uid": uid,
        };
        let update = doc! {
            "$set": {
                key: bson::to_bson(&update).unwrap()
            }
        };
        let mut options = FindOneAndUpdateOptions::default();
        options.return_document = Some(mongodb::options::ReturnDocument::After);
        self.collection
            .find_one_and_update(query, update, options)
            .await
            .map_model_result()?
            .ok_or_else(|| Error::UserNotFound(uid.to_string()))
    }
}
