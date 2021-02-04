use model::{AnonymousUserInfo, AuthenticationInfo, HistoryData, User, UserInfo};
use model::{SessionAuthInfo, Model, RedisCache, SessionID};
use sha2::{Digest, Sha256};
use crate::{error::*, service::Service};

pub struct LoginData {

}

pub struct UserService<'m> {
    model: &'m Model,
    redis: &'m RedisCache,
}

impl<'m> UserService<'m> {
    pub fn new(service: &'m Service) -> Self{
        Self{
            model: &service.model,
            redis: &service.redis,
        }
    }

    pub async fn auth(&self, session_id: &SessionID, token: &str) -> Result<SessionAuthInfo> {
        let session = self.redis.session(session_id).get()
            .await
            .map_service_err()?
            .ok_or(Error::Unauthorized)?;
        
        if session.auth_info.token != token {
            Err(Error::Unauthorized)
        } else {
            Ok(session.auth_info)
        }
        
    }

    /// Get or create an anonymous user
    pub async fn get_anonymous(&self, info: &AnonymousUserInfo) -> Result<User> {
        let user = User::anonymous(info);
        
        match self.model.user.get_by_uid(&user.uid).await {
            Ok(user) => return Ok(user),
            Err(model::Error::UserNotFound(_)) => (),
            err => return err.map_service_err(),
        };

        self.model.user.add(&user).await.map_service_err()?;
        self.model.history.record(&user.uid, model::Operation::Create, HistoryData::User(user.clone()))
            .await
            .map_service_err()?;

        Ok(user)
    }

    pub async fn register(&self, uid: &str, info: &UserInfo, auth_info: &AuthenticationInfo) -> Result<User> {
        let user = User::registered_user(uid, info, auth_info);
        
        self.model.user.add(&user).await.map_service_err()?;
        self.model.history.record(uid, model::Operation::Create, HistoryData::User(user.clone()))
            .await
            .map_service_err()?;

        Ok(user)
    }

    pub async fn login(&self, session_id: &SessionID, uid: &str, user_pwd_hash: &str)->Result<User> {
        let result = self.model.user.get_by_uid(uid).await;
        let user = match result {
            Err(model::Error::UserNotFound(_)) => return Err(Error::PasswordIncorrect),
            Err(err) => return Err(Error::from(err)),
            Ok(user) => user,
        };

        let hashFunc: HashFunc = match &user.auth_info.method {
            model::HashMethod::SHA256 => sha256,
            model::HashMethod::NoLogin => return Err(Error::PasswordIncorrect),
        };

        let salt = self.redis.session(session_id).salt()
            .await
            .map_service_err()?
            .ok_or(Error::PasswordIncorrect)?;


        let server_pwd_hash = hashFunc(format!("{}{}", user.auth_info.password_hash, salt).as_str());
        if server_pwd_hash == user_pwd_hash {
            Ok(user)
        } else {
            Err(Error::PasswordIncorrect)
        }
    }
}

type HashFunc = fn(input: &str) -> String;

fn sha256(input: &str) -> String {
    format!("{:x}", Sha256::digest(input.as_bytes()))
}