use actix_web::{get, web::{ServiceConfig, scope}};

#[get("/error_report")]
async fn test_error_report() -> String {
    log::error!("Nothing error.");
    "".to_owned()
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/test")
        .service(test_error_report)
    );
}
