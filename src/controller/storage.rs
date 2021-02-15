use actix_web::{post, web::{ServiceConfig, scope}};
use serde::{Serialize};

use crate::misc::{error::MapControllerError, response::Response};

use super::{executor::execute, extractor};

#[derive(Serialize)]
struct OSSUploadInfo {
    key: String,
    token: String,
    upload: String,
}


#[post("/new")]
async fn new_object_key(service: extractor::Service) -> Response<OSSUploadInfo> {
    execute(async move {
        let info = OSSUploadInfo {
            key: service.storage().new_random_name().await.map_contoller_result()?,
            token: service.storage().qiniu_token().await.map_contoller_result()?,
            upload: "https://upload.qiniup.com".to_owned(),
        };
        Ok(info)
    }).await
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/oss")
            .service(new_object_key)
    );
}