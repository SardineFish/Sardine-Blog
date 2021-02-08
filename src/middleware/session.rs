use std::{cell::RefCell, rc::Rc};

use actix_http::{HttpMessage, body::{Body}};
use actix_web::{dev::{ServiceRequest, ServiceResponse}, web};

use sar_blog::{Service, model::SessionID};

use crate::misc::cookie::gen_session_cookie;

use super::func_middleware::*;

pub struct Session {
    pub session_id: SessionID,
}

impl Session {
    fn new (session_id: SessionID)  -> Self {
        Self {
            session_id
        }
    }
    pub fn id(&self) -> &String {
        &self.session_id
    }
}

fn map_internal_error(err: sar_blog::Error) -> actix_web::Error {
    actix_web::error::ErrorInternalServerError(err)
}

async fn session_middleware<S>(request: ServiceRequest, srv: Rc<RefCell<S>>) -> Result<ServiceResponse, actix_web::Error> 
where
    S: ServiceT<Body>,
    S::Future: 'static,
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

    request.extensions_mut().insert(Session::new(session_id.clone()));

    let mut response = srv.borrow_mut().call(request).await?;

    let service = response.request().app_data::<web::Data<Service>>().unwrap();
    if set_session {
        let cookie = gen_session_cookie(&session_id, service.option.session_expire);
        response.response_mut().add_cookie(&cookie)?;
    }

    Ok(response)
}

async_middleware!(pub session, session_middleware);