use std::{vec};

use actix_web::{HttpRequest, delete, get, post, put, web::{Json, Path, ServiceConfig, scope}};
use sar_blog::{AuthChallenge, AuthToken, model::{Access, AuthenticationInfo, HashMethod, User, UserInfo}};
use serde::{Serialize, Deserialize};

use crate::{middleware, misc::{cookie::gen_token_cookies, error::MapControllerError, response::{Redirect, Response, WithCookie}}};

use super::{extractor};

use Response::Ok;

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


#[get("", wrap = "middleware::authentication(Access::Registered)")]
async fn check_auth(auth: extractor::Auth) -> Response<String> {
    Ok(auth.0.uid)
}

#[get("/{uid}/challenge")]
async fn get_challenge(service: extractor::Service, session: extractor::Session, Path(uid): Path<String>) -> Response<AuthChallenge> {
    service.user().get_auth_challenge(session.id(), &uid)
        .await
        .map_contoller_result()
        .into()
}

#[post("/login")]
async fn login<'c>(service: extractor::Service, session: extractor::Session, data: Json<LoginData>) -> Response<WithCookie<'c, AuthToken>> {
    let token = service.user().login(session.id(), &data.uid, &data.pwd_hash)
        .await
        .map_contoller_result()?;

    let (cookie_session, cookie_token) = gen_token_cookies(&token, service.option.session_expire);

    Ok(WithCookie(token, vec![cookie_session, cookie_token]))
}

#[post("/signup")]
async fn sign_up<'c>(service: extractor::Service, session: extractor::Session, data: Json<SignUpData>) -> Response<WithCookie<'c, AuthToken>> {
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
    let token = service.user().register(session.id(), &data.uid, &user_info, &auth_info)
        .await
        .map_contoller_result()?;

    let (cookie_session, cookie_token) = gen_token_cookies(&token, service.option.session_expire);
    
    Ok(WithCookie(token, vec![cookie_session, cookie_token]))
}

#[delete("/session", wrap="middleware::authentication(Access::Registered)")]
async fn sign_out_self(service: extractor::Service, session: extractor::Session) -> Response<()> {
    service.user().sign_out(session.id(), session.id())
        .await
        .map_contoller_result()
        .into()
}

#[delete("/session/{session_id}", wrap="middleware::authentication(Access::Registered)")]
async fn sign_out_session(service: extractor::Service, session: extractor::Session, Path(target): Path<String>) -> Response<()> {
    service.user().sign_out(&target, session.id())
        .await
        .map_contoller_result()
        .into()
}

#[put("/{uid}/access", wrap="middleware::authentication(Access::Trusted)")]
async fn grant_access(service: extractor::Service, session: extractor::Session, Path(uid): Path<String>, data: Json<GrantAccessData>) -> Response<UserAccessInfo> {
    let user = service.user().grant_access(session.id(), &uid, data.access)
        .await
        .map_contoller_result()?;
    Ok(UserAccessInfo::from(user))
}

#[get("/{uid}/avatar")]
async fn get_avatar(service: extractor::Service, Path(uid): Path<String>) -> Response<Redirect> {
    let avatar = service.user().get_avatar(&uid).await.map_contoller_result()?;
    Ok(Redirect::SeeOther(avatar))
}

#[get("/info", wrap = "middleware::authentication(Access::Registered)")]
async fn get_info(service: extractor::Service, auth: extractor::Auth) -> Response<UserInfo> {
    let user = service.user().get_user(&auth.uid).await.map_contoller_result()?;
    Ok(user.info)
}

#[delete("/{uid}/info/email")]
async fn delete_email(service: extractor::Service, Path(uid): Path<String>, request: HttpRequest) -> Response<()> {
    match service.user().get_user(&uid).await {
        Result::Ok(user) => {
            if user.access <= Access::Anonymous {
                service.user().unsubscribe_notification(&uid).await.map_contoller_result()?;
                Ok(())
            } else {
                let auth = middleware::auth_from_request(&service, &request)
                    .await?
                    .ok_or(sar_blog::Error::AccessDenied)
                    .map_contoller_result()?;
                if auth.uid == user.uid {
                    service.user().unsubscribe_notification(&uid).await.map_contoller_result()?;
                    Ok(())
                } else {
                    Err(sar_blog::Error::AccessDenied).map_contoller_result().into()
                }
            }
        },
        Result::Err(sar_blog::Error::DataNotFound(_)) => Err(sar_blog::Error::AccessDenied).map_contoller_result().into(),
        Result::Err(err) => Err(err).map_contoller_result().into(),
    }
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/user")
        .service(login)
        .service(sign_up)
        .service(get_challenge)
        .service(sign_out_self)
        .service(sign_out_session)
        .service(grant_access)
        .service(get_avatar)
        .service(check_auth)
        .service(get_info)
        .service(delete_email)
    );
}