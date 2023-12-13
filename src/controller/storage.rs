use actix_web::{
    post,
    web::{scope, ServiceConfig},
};
use serde::Serialize;

use crate::misc::{error::MapControllerError, response::Response};

use super::extractor;

use Response::Ok;

#[derive(Serialize)]
struct OSSUploadInfo {
    key: String,
    token: String,
    upload: String,
}

#[post("/new")]
async fn new_object_key(service: extractor::Service) -> Response<OSSUploadInfo> {
    let info = OSSUploadInfo {
        key: service
            .storage()
            .new_random_name()
            .await
            .map_contoller_result()?,
        token: service
            .storage()
            .qiniu_token()
            .await
            .map_contoller_result()?,
        upload: "https://upload.qiniup.com".to_owned(),
    };
    Ok(info)
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(scope("/oss").service(new_object_key));
}
