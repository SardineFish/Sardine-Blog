use std::{cell::RefCell, rc::Rc};

use actix_http::{HttpMessage, body::MessageBody, cookie::Cookie, error::ErrorInternalServerError};
use actix_web::{dev::{Service, ServiceRequest, ServiceResponse}, web};
use sar_blog::Error as ServiceError;
use crate::misc::error;

use crate::misc::response::Response;

use super::func_middleware::*;

async fn auth_middleware<S>(request: ServiceRequest, srv: Rc<RefCell<S>>) -> Result<ServiceResponse, actix_web::Error> 
where
    S: ServiceT,
    S::Future: 'static,
{
    let service = request.app_data::<sar_blog::Service>().unwrap();
    if let (Some(session_id), Some(token)) = (request.cookie("session_id"), request.cookie("token")) {
        match service.user().auth(&session_id.value().to_string(), token.value()).await {
            Ok(info) => request.extensions_mut().insert(info),
            Err(ServiceError::Unauthorized) => return Response::<()>::ClientError(error::Error::ServiceError(ServiceError::Unauthorized))
                .to_service_response(request).await,
            Err(err) => return Response::<()>::ServerError(error::Error::ServiceError(err)).to_service_response(request).await
        };
        
    }
    
    srv.borrow_mut().call(request).await
}

async_middleware!(pub authentication, auth_middleware);