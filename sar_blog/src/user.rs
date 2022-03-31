use std::{cell::RefMut};

use chrono::{Utc};
use model::{Access, AnonymousUserInfo, AuthenticationInfo, HashMethod, HistoryData, User, UserInfo};
use model::{SessionAuthInfo, Model, RedisCache, SessionID};
use rand::{RngCore, prelude::StdRng};
use sha2::{Digest, Sha256};
use serde::{Serialize};
use crate::{error::*, service::Service, validate::{Validate, validate_uid}};

#[derive(Serialize)]
pub struct AuthChallenge {
    pub method: HashMethod,
    pub salt: String,
    pub challenge: String,
}

pub enum Author {
    Anonymous(AnonymousUserInfo),
    Authorized(SessionAuthInfo),
}

pub struct UserService<'m> {
    service: &'m Service,
    model: &'m Model,
    redis: &'m RedisCache,
}

#[derive(Serialize, Clone)]
pub struct AuthToken {
    pub session_id: SessionID, 
    pub token: String,
    pub expire: i64,
}

impl<'m> UserService<'m> {
    pub fn new(service: &'m Service) -> Self{
        Self{
            service,
            model: &service.model,
            redis: &service.redis,
        }
    }

    pub async fn auth_session(&self, session_id: &str, token: &str) -> Result<SessionAuthInfo> {
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

    pub async fn auth_access(&self, uid: &str, required_access: Access) -> Result<User> {
        let user = self.model.user.get_by_uid(uid).await?;
        if user.access >= required_access {
            Ok(user)
        } else {
            Err(Error::AccessDenied)
        }
    }

    /// Get or create an anonymous user
    pub async fn get_anonymous(&self, info: &AnonymousUserInfo) -> Result<User> {
        info.validate()?;
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

    pub async fn register(&self, session_id: &SessionID, uid: &str, info: &UserInfo, auth_info: &AuthenticationInfo) -> Result<AuthToken> {
        validate_uid(uid)?;
        let user = User::registered_user(uid, info, auth_info);
        
        self.model.user.add(&user).await.map_service_err()?;
        self.model.history.record(uid, model::Operation::Create, HistoryData::User(user.clone()))
            .await
            .map_service_err()?;

        self.grant_token(session_id, uid).await
    }

    pub async fn login(&self, session_id: &SessionID, uid: &str, user_pwd_hash: &str)->Result<AuthToken> {
        let result = self.model.user.get_by_uid(uid).await;
        let user = match result {
            Err(model::Error::UserNotFound(_)) => return Err(Error::PasswordIncorrect),
            Err(err) => return Err(Error::from(err)),
            Ok(user) => user,
        };

        let hash_func: HashFunc = match &user.auth_info.method {
            model::HashMethod::SHA256 => sha256,
            model::HashMethod::SHA1 => sha1,
            model::HashMethod::MD5 => md5,
            model::HashMethod::Plain => plain,
            model::HashMethod::NoLogin => return Err(Error::PasswordIncorrect),
        };

        let challenge = self.redis.session(session_id).use_challenge()
            .await
            .map_service_err()?
            .ok_or(Error::InvalidChallenge)?;


        let server_pwd_hash = hash_func(format!("{}{}", user.auth_info.password_hash, challenge).as_str());
        if server_pwd_hash != user_pwd_hash {
            return Err(Error::PasswordIncorrect);
        }

        self.grant_token(session_id, uid).await
    }

    pub async fn get_auth_challenge(&self, session_id: &SessionID, uid: &str) -> Result<AuthChallenge> {
        let result = self.model.user.get_by_uid(uid).await;
        match result {
            Ok(user) => self.create_challenge(session_id, &user.auth_info.salt, user.auth_info.method).await,
            Err(model::Error::UserNotFound(_)) => self.create_fake_challenge(session_id, uid).await,
            Err(err)=> Err(err).map_service_err()
        }
    }

    pub async fn sign_out(&self, target_session: &SessionID, session_id: &SessionID) -> Result<()> {
        if target_session != session_id {
            let self_uid = self.redis.session(session_id).uid()
                .await
                .map_service_err()?
                .ok_or(Error::Unauthorized)?;
            let target_uid = self.redis.session(target_session).uid()
                .await
                .map_service_err()?
                .ok_or_else(|| Error::DataNotFound(model::Error::SessionNotFound(target_session.to_string())))?;
            if self_uid != target_uid {
                return Err(Error::Unauthorized);
            }
        }

        let token = self.redis.session(session_id).access_token().await.map_service_err()?;
        let uid = self.redis.session(session_id).uid().await.map_service_err()?;
        self.redis.session(session_id).delete().await.map_service_err()?;
        if let (Some(token), Some(uid)) = (token, uid) {
            self.redis.access().delete_session_token(&uid, session_id, &token).await.map_service_err()?;
        }

        Ok(())
    }

    pub async fn get_access(&self, session_id: &SessionID) -> Result<Access> {
        let uid = self.redis.session(session_id).uid()
            .await
            .map_service_err()?
            .ok_or(Error::Unauthorized)?;
        match self.model.user.get_by_uid(&uid).await {
            Ok(user) => Ok(user.access),
            Err(model::Error::UserNotFound(_)) => Err(Error::Unauthorized),
            Err(err) => Err(Error::from(err)),
        }
    }

    pub async fn grant_access(&self, session_id: &SessionID, uid: &str, access: Access) -> Result<User> {
        let user = self.model.user.get_by_uid(uid).await.map_service_err()?;
        let self_access = self.get_access(session_id).await.map_service_err()?;
        if self_access <= user.access {
            return Err(Error::Unauthorized);
        }
        
        let user = self.model.user.grant_access(uid, access).await.map_service_err()?;
        Ok(user)
    }

    pub async fn get_avatar(&self, uid: &str) -> Result<String> {
        let result = self.model.user.get_by_uid(uid).await;
        match result {
            Ok(user) => Ok(user.info.avatar),
            Err(model::Error::UserNotFound(_)) => Ok(self.service.option.default_avatar.clone()),
            Err(err) => Err(err)?
        }
    }

    pub async fn get_user(&self, uid: &str) -> Result<User> {
        Ok(self.model.user.get_by_uid(uid).await?)
    }

    pub async fn unsubscribe_notification(&self, uid: &str) -> Result<User> {
        Ok(self.model.user.delete_email(uid).await?)
    }

    async fn grant_token(&self, session_id: &SessionID, uid: &str) -> Result<AuthToken> {
        let token = gen_token(self.service.rng.borrow_mut());

        self.redis.session(session_id).set_uid(uid).await.map_service_err()?;
        self.redis.session(session_id).set_access_token(&token).await.map_service_err()?;
        self.redis.access().add_token(uid, session_id, &token, self.service.option.session_expire.num_seconds() as usize)
            .await
            .map_service_err()?;

        Ok(AuthToken {
            session_id: session_id.clone(),
            token,
            expire: (Utc::now() + self.service.option.session_expire).timestamp()
        })
    }

    async fn create_fake_challenge(&self, session_id: &SessionID, uid: &str) -> Result<AuthChallenge> {
        if let Some(salt) = self.redis.access().get_fake_salt(uid).await.map_service_err()? {
            self.create_challenge(session_id, &salt, HashMethod::SHA256).await
        } else {
            let mut salt: [u8;16] = [0;16];
            {
                let mut rng = self.service.rng.borrow_mut();
                rng.fill_bytes(&mut salt);
            }
            let salt = hex::encode(&salt);
            self.redis.access().set_fake_salt(uid, &salt, 600).await.map_service_err()?;
            self.create_challenge(session_id, &salt, HashMethod::SHA256).await
        }
    }

    async fn create_challenge(&self, session_id: &SessionID, salt: &str, method: HashMethod) -> Result<AuthChallenge> {
        let mut challenge: [u8; 16] = [0; 16];
        {
            let mut rng = self.service.rng.borrow_mut();
            rng.fill_bytes(&mut challenge);   
        }

        let challenge = hex::encode(challenge);
        self.redis.session(session_id)
            .set_challenge(&challenge, self.service.option.challenge_expire.num_seconds() as usize)
            .await
            .map_service_err()?;

        Ok(AuthChallenge {
            challenge,
            method,
            salt: salt.to_string(),
        })
    }

}

type HashFunc = fn(input: &str) -> String;

fn sha256(input: &str) -> String {
    format!("{:x}", Sha256::digest(input.as_bytes()))
}
fn sha1(input: &str) -> String {
    let mut hasher = sha1::Sha1::new();
    hasher.update(input);
    String::from_utf8(hasher.finalize().to_ascii_lowercase()).unwrap()
}
fn md5(input: &str) -> String {
    format!("{:x}", md5::compute(input))
}
fn plain(input: &str) -> String {
    input.to_string()
}

fn gen_token(mut rng: RefMut<StdRng>) -> String {
    let mut buffer: [u8;32] = [0;32];
    rng.fill_bytes(&mut buffer);
    format!("{:x}", Sha256::digest(&buffer))
}