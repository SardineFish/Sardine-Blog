use std::{cell::RefCell, rc::Rc};

use actix_http::{HttpMessage, body::MessageBody, cookie::Cookie, error::ErrorInternalServerError};
use actix_web::{dev::{ServiceRequest, ServiceResponse}, web};

use sar_blog::Service;
use time::{Duration, OffsetDateTime};

#[macro_use]
use super::func_middleware::*;

fn map_internal_error(err: sar_blog::Error) -> actix_web::Error {
    actix_web::error::ErrorInternalServerError(err)
}

async fn session_middleware<S, B>(request: ServiceRequest, srv: Rc<RefCell<S>>) -> Result<ServiceResponse<B>, actix_web::Error> 
where
    S: ServiceT<B>,
    S::Future: 'static,
    B: MessageBody,
{
    let service = request.app_data::<web::Data<sar_blog::Service>>().unwrap();
    let mut set_session = false;

    let session_id = if let Some(cookie) = request.cookie("session_id") {
        let session_id = cookie.value().to_string();
        let valid = service.session().validate(&session_id).await
            .map_err(map_internal_error)?;
        if valid {
            session_id
        } else {
            set_session = true;
            service.session().new_session().await.map_err(map_internal_error)?
        }
    } else {
        set_session = true;
        service.session().new_session().await.map_err(map_internal_error)?
    };

    let mut response = srv.borrow_mut().call(request).await?;
    if set_session {
        let mut cookie = Cookie::new("session_id", &session_id);
        let now = OffsetDateTime::now_utc();
        cookie.set_expires(now + Duration::weeks(1));
        response.response_mut().add_cookie(&cookie)?;
    }

    Ok(response)
}

async_middleware!(pub session, session_middleware);