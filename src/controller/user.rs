use actix_web::{delete, get, post, put, web::{Json, Path, ServiceConfig, scope}};
use sar_blog::{AuthChallenge, AuthToken, model::{Access, AuthenticationInfo, HashMethod, User, UserInfo}};
use serde::{Serialize, Deserialize};

use crate::{middleware, misc::{error::MapControllerError, response::Response}};

use super::{executor::execute, extractor};

#[derive(Deserialize)]
struct LoginData {
    uid: String,
    pwd_hash: String,
}

#[derive(Deserialize)]
struct SignUpData {
    uid: String,
    pwd_hash: String,
    salt: String,
    method: HashMethod,
    name: String,
    avatar: String,
    email: Option<String>,
    url: Option<String>,
}

#[derive(Serialize)]
struct UserAccessInfo {
    uid: String,
    name: String,
    access: Access,
}

impl From<User> for UserAccessInfo {
    fn from(user: User) -> Self {
        Self {
            uid: user.uid,
            access: user.access,
            name: user.info.name,
        }
    }
}

#[derive(Deserialize)]
struct GrantAccessData {
    access: Access,
}

#[get("/{uid}/challenge")]
async fn get_challenge(service: extractor::Service, session: extractor::Session, Path(uid): Path<String>) -> Response<AuthChallenge> {
    execute(async move {
        service.user().get_auth_challenge(session.id(), &uid)
            .await
            .map_contoller_result()
    }).await
}

#[post("/login")]
async fn login(service: extractor::Service, session: extractor::Session, data: Json<LoginData>) -> Response<AuthToken> {
    execute(async move {
        service.user().login(session.id(), &data.uid, &data.pwd_hash)
            .await
            .map_contoller_result()
    }).await
}

#[post("/signup")]
async fn sign_up(service: extractor::Service, session: extractor::Session, data: Json<SignUpData>) -> Response<AuthToken> {
    execute(async move {
        let user_info = UserInfo {
            name: data.name.clone(),
            avatar: data.avatar.clone(),
            email: data.email.clone(),
            url: data.url.clone(),
        };
        let auth_info = AuthenticationInfo {
            method: data.method.clone(),
            password_hash: data.pwd_hash.clone(),
            salt: data.salt.clone(),
        };
        service.user().register(session.id(), &data.uid, &user_info, &auth_info)
            .await
            .map_contoller_result()
    }).await
}

#[delete("/session", wrap="middleware::authentication()")]
async fn sign_out_self(service: extractor::Service, session: extractor::Session) -> Response<()> {
    execute(async move {
        service.user().sign_out(session.id(), session.id())
            .await
            .map_contoller_result()
    }).await
}

#[delete("/session/{session_id}", wrap="middleware::authentication()")]
async fn sign_out_session(service: extractor::Service, session: extractor::Session, Path(target): Path<String>) -> Response<()> {
    execute(async move {
        service.user().sign_out(&target, session.id())
            .await
            .map_contoller_result()
    }).await
}

#[put("/{uid}/access", wrap="middleware::authentication()")]
async fn grant_access(service: extractor::Service, session: extractor::Session, Path(uid): Path<String>, data: Json<GrantAccessData>) -> Response<UserAccessInfo> {
    execute(async move {
        let user = service.user().grant_access(session.id(), &uid, data.access)
            .await
            .map_contoller_result()?;
        Ok(UserAccessInfo::from(user))
    }).await
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/user")
        .service(login)
        .service(sign_up)
        .service(get_challenge)
        .service(sign_out_self)
        .service(sign_out_session)
        .service(grant_access)
    );
}