use actix_web::cookie::{Cookie, CookieBuilder, SameSite};
use chrono::Duration;
use sar_blog::AuthToken;

fn to_expire_time(duration: Duration) -> time_crate::OffsetDateTime {
    time_crate::OffsetDateTime::now_utc() + time_crate::Duration::seconds(duration.num_seconds())
}

pub fn gen_token_cookies(token: &AuthToken, lifetime: Duration) -> (Cookie<'static>, Cookie<'static>) {
    (
        gen_session_cookie(&token.session_id, lifetime),
        CookieBuilder::new("token", token.token.clone())
            .expires(to_expire_time(lifetime))
            .path("/")
            .same_site(SameSite::Strict)
            .finish()
    )
}

pub fn gen_session_cookie(session_id: &str, lifetime: Duration) -> Cookie<'static> {
    let cookie = CookieBuilder::new("session_id", session_id.to_string())
            .expires(to_expire_time(lifetime))
            .path("/")
            .same_site(actix_web::cookie::SameSite::Strict)
            .finish();

    log::debug!("{}", cookie);
    cookie
}