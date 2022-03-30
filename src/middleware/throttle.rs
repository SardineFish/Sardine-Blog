use actix_http::{body::Body};
use actix_web::{dev::{ServiceRequest, ServiceResponse}, web};

use crate::misc::{error::Error, response::Response};

use super::func_middleware::*;

async fn throttle_middleware<S>(request: ServiceRequest, srv: SyncService<S>, interval_seconds: usize) -> Result<ServiceResponse, actix_web::Error> 
where
    S: ServiceT<Body>,
    S::Future: 'static,
{
    let remote = match request.headers().get("X-Real-IP") {
        Some(v) => v.to_str().unwrap_or("<unknown>").to_string(),
        None => request.peer_addr().map(|s|s.ip().to_string()).unwrap_or("<unknown>".to_owned()),
    };
    
    let service = request.app_data::<web::Data<sar_blog::Service>>().unwrap();
    if let Err(err) =  service.session().throttle(&remote, interval_seconds).await {
        return Response::<()>::from(Err(Error::from(err))).into_service_response(request).await;
    }
    srv.lock().await.call(request).await
}

// async_middleware!(pub authentication, auth_middleware);
async_middleware!(pub fn throttle(interval_seconds: usize), throttle_middleware(interval_seconds));