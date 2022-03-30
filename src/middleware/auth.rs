use actix_http::{HttpMessage, body::{Body}};
use actix_web::{dev::{ServiceRequest, ServiceResponse}, web};
use error::Error;
use sar_blog::{Error as ServiceError, model::{Access, SessionAuthInfo}};
use crate::misc::error;

use crate::misc::response::Response;

use super::func_middleware::*;

pub async fn auth_from_request<T : HttpMessage>(service: &sar_blog::Service, request: &T) -> Result<Option<SessionAuthInfo>, Error> {
    let (session_id, token) 
        = (request.cookie("session_id"), request.cookie("token"));
    if let (Some(session_id), Some(token)) = (session_id, token) {
        match service.user().auth_session(session_id.value(), token.value()).await {
            Ok(info) => {
                Ok(Some(info))
            },
            Err(ServiceError::Unauthorized) => Ok(None),
            Err(err) => Err(Error::Service(err)),
        }
    } else {
        Ok(None)
    }
}

async fn auth_middleware<S>(request: ServiceRequest, srv: SyncService<S>, access: Access) -> Result<ServiceResponse, actix_web::Error> 
where
    S: ServiceT<Body>,
    S::Future: 'static,
{
    let service = request.app_data::<web::Data<sar_blog::Service>>().unwrap();

    let result = match auth_from_request(service, &request).await {
        Ok(Some(info)) => {
            match service.user().auth_access(&info.uid, access).await {
                Ok(_) => {
                    request.extensions_mut().insert(info);
                    Ok(())
                },
                Err(ServiceError::AccessDenied) => Err(Response::<()>::ClientError(error::Error::Service(ServiceError::AccessDenied))),
                Err(err) =>Err(Response::<()>::ServerError(error::Error::Service(err))),
            }
        },
        Ok(None) => Err(Response::<()>::ClientError(error::Error::Service(ServiceError::Unauthorized))),
        Err(err) => Err(Response::<()>::ServerError(err)),
    };
    match result {
        Ok(_) => (),
        Err(response) => return response.into_service_response(request).await,
    }
    
    srv.lock().await.call(request).await
}

// async_middleware!(pub authentication, auth_middleware);
async_middleware!(pub fn authentication(access: Access), auth_middleware(access));