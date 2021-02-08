use std::{cell::RefCell, rc::Rc};

use actix_http::{HttpMessage, body::{Body, MessageBody}, cookie::Cookie, error::ErrorInternalServerError};
use actix_web::{dev::{Service, ServiceRequest, ServiceResponse}, web};
use error::Error;
use sar_blog::{Error as ServiceError, model::SessionAuthInfo, model::User};
use crate::misc::error;

use crate::misc::response::Response;

use super::func_middleware::*;

pub async fn auth_from_request<T : HttpMessage>(service: &sar_blog::Service, request: &T) -> Result<Option<SessionAuthInfo>, Error> {
    let (session_id, token) 
        = (request.cookie("session_id"), request.cookie("token"));
    if let (Some(session_id), Some(token)) = (session_id, token) {
        match service.user().auth(session_id.value(), token.value()).await {
            Ok(info) => {
                Ok(Some(info))
            },
            Err(ServiceError::Unauthorized) => Ok(None),
            Err(err) => Err(Error::ServiceError(err)),
        }
    } else {
        Ok(None)
    }
}

async fn auth_middleware<S>(request: ServiceRequest, srv: Rc<RefCell<S>>) -> Result<ServiceResponse, actix_web::Error> 
where
    S: ServiceT<Body>,
    S::Future: 'static,
{
    let service = request.app_data::<web::Data<sar_blog::Service>>().unwrap();

    match auth_from_request(service, &request).await {
        Ok(Some(info)) => request.extensions_mut().insert(info),
        Ok(None) => return Response::<()>::ClientError(error::Error::ServiceError(ServiceError::Unauthorized))
                .to_service_response(request).await,
        Err(err) => return Response::<()>::ServerError(err).to_service_response(request).await
    }
    
    srv.borrow_mut().call(request).await
}

async_middleware!(pub authentication, auth_middleware);