use std::time::Duration;

use actix_web::{
    get,
    http::StatusCode,
    web::{Data, ServiceConfig},
    HttpResponse,
};
use sar_blog::Service;

const HEALTH_TIMEOUT: Duration = Duration::from_secs(2);

#[get("/api/health")]
async fn live() -> HttpResponse {
    HttpResponse::NoContent().finish()
}

#[get("/api/health/database")]
async fn database(service: Data<Service>) -> HttpResponse {
    health_response(
        tokio::time::timeout(HEALTH_TIMEOUT, service.database_health())
            .await
            .unwrap_or(false),
    )
}

#[get("/api/health/search")]
async fn search(service: Data<Service>) -> HttpResponse {
    health_response(
        tokio::time::timeout(HEALTH_TIMEOUT, service.search_health())
            .await
            .unwrap_or(false),
    )
}

fn health_response(healthy: bool) -> HttpResponse {
    HttpResponse::build(if healthy {
        StatusCode::NO_CONTENT
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    })
    .finish()
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(live).service(database).service(search);
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, App};

    #[actix_web::test]
    async fn liveness_does_not_require_dependencies() {
        let app = test::init_service(App::new().configure(config)).await;
        let request = test::TestRequest::get().uri("/api/health").to_request();
        let response = test::call_service(&app, request).await;

        assert_eq!(response.status(), StatusCode::NO_CONTENT);
    }
}
