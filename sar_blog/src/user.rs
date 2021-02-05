use std::{borrow::BorrowMut, cell::RefMut};

use model::{AnonymousUserInfo, AuthenticationInfo, HashMethod, HistoryData, User, UserInfo};
use model::{SessionAuthInfo, Model, RedisCache, SessionID};
use rand::{RngCore, prelude::StdRng};
use sha2::{Digest, Sha256};
use serde::{Serialize};
use crate::{error::*, service::Service};

#[derive(Serialize)]
pub struct AuthChallenge {
    pub method: HashMethod,
    pub salt: String,
    pub challenge: String,
}

pub struct UserService<'m> {
    service: &'m Service,
    model: &'m Model,
    redis: &'m RedisCache,
}

impl<'m> UserService<'m> {
    pub fn new(service: &'m Service) -> Self{
        Self{
            service,
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

        let hash_func: HashFunc = match &user.auth_info.method {
            model::HashMethod::SHA256 => sha256,
            model::HashMethod::NoLogin => return Err(Error::PasswordIncorrect),
        };

        let challenge = self.redis.session(session_id).challenge()
            .await
            .map_service_err()?
            .ok_or(Error::PasswordIncorrect)?;


        let server_pwd_hash = hash_func(format!("{}{}", user.auth_info.password_hash, challenge).as_str());
        if server_pwd_hash != user_pwd_hash {
            return Err(Error::PasswordIncorrect);
        }

        let token = gen_token(self.service.rng.borrow_mut());

        self.redis.session(session_id).set_uid(&user.uid).await.map_service_err()?;
        self.redis.session(session_id).set_access_token(&token).await.map_service_err()?;
        self.redis.access().add_session_by_uid(uid, session_id).await.map_service_err()?;
        
        Ok(user)
    }

    pub async fn get_login_info(&self, session_id: &SessionID, uid: &str) -> Result<AuthChallenge> {
        let result = self.model.user.get_by_uid(uid).await;
        match result {
            Ok(user) => self.create_challenge(session_id, &user.auth_info.salt, user.auth_info.method).await,
            Err(model::Error::UserNotFound(_)) => self.create_fake_challenge(session_id, uid).await,
            Err(err)=> Err(err).map_service_err()
        }
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
        let mut rng = self.service.rng.borrow_mut();
        rng.fill_bytes(&mut challenge);

        let challenge = hex::encode(challenge);
        self.redis.session(session_id).set_challenge(&challenge).await.map_service_err()?;

        Ok(AuthChallenge {
            challenge: hex::encode(&challenge),
            method,
            salt: salt.to_string(),
        })
    }

}

type HashFunc = fn(input: &str) -> String;

fn sha256(input: &str) -> String {
    format!("{:x}", Sha256::digest(input.as_bytes()))
}

fn gen_token(mut rng: RefMut<StdRng>) -> String {
    let mut buffer: [u8;32] = [0;32];
    rng.fill_bytes(&mut buffer);
    format!("{:x}", Sha256::digest(&buffer))
}