use crate::misc::error;
use actix_http::{body::BoxBody, HttpMessage};
use actix_web::{
    dev::{ServiceRequest, ServiceResponse},
    web::{self},
    FromRequest, HttpRequest,
};
use actix_web_httpauth::extractors::basic::BasicAuth;
use error::Error;
use sar_blog::{
    model::{Access, SessionAuthInfo},
    Error as ServiceError,
};

use crate::misc::response::Response;

use super::func_middleware::*;

pub async fn auth_from_request(
    service: &sar_blog::Service,
    request: &HttpRequest,
) -> Result<Option<SessionAuthInfo>, Error> {
    let (session_id, token) = (request.cookie("session_id"), request.cookie("token"));

    let mut payload = actix_http::Payload::None;
    let http_auth = BasicAuth::from_request(request, &mut payload).await;
    match (http_auth, session_id, token) {
        // First try HTTP busic auth
        (Ok(auth), _, _) if auth.password().is_some() => {
            match service
                .user()
                .auth_session(auth.user_id(), auth.password().unwrap())
                .await
            {
                Ok(info) => Ok(Some(info)),
                Err(ServiceError::Unauthorized) => Ok(None),
                Err(err) => Err(Error::Service(err)),
            }
        }
        // Then try cookie auth
        (_, Some(session_id), Some(token)) => match service
            .user()
            .auth_session(session_id.value(), token.value())
            .await
        {
            Ok(info) => Ok(Some(info)),
            Err(ServiceError::Unauthorized) => Ok(None),
            Err(err) => Err(Error::Service(err)),
        },
        _ => Ok(None),
    }
}

async fn auth_middleware<S>(
    mut request: ServiceRequest,
    srv: &'static S,
    access: Access,
) -> Result<ServiceResponse<BoxBody>, actix_web::Error>
where
    S: ServiceT<BoxBody>,
    S::Future: 'static,
{
    // SAFE: STUPID actix
    let http_req = unsafe { &*(request.parts_mut().0 as *const HttpRequest) };
    let service = request.app_data::<web::Data<sar_blog::Service>>().unwrap();

    let result = match auth_from_request(service, http_req).await {
        Ok(Some(info)) => match service.user().auth_access(&info.uid, access).await {
            Ok(_) => {
                request.extensions_mut().insert(info);
                Ok(())
            }
            Err(ServiceError::AccessDenied) => Err(Response::<()>::ClientError(
                error::Error::Service(ServiceError::AccessDenied),
            )),
            Err(err) => Err(Response::<()>::ServerError(error::Error::Service(err))),
        },
        Ok(None) => Err(Response::<()>::ClientError(error::Error::Service(
            ServiceError::Unauthorized,
        ))),
        Err(err) => Err(Response::<()>::ServerError(err)),
    };
    match result {
        Ok(_) => (),
        Err(response) => return response.into_service_response(request).await,
    }

    srv.call(request).await
}

// async_middleware!(pub authentication, auth_middleware);
async_middleware!(pub fn authentication(access: Access), auth_middleware(access));
