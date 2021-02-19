use std::cmp::max;

use chrono::{Duration, Utc};
use model::Model;
use options::ServiceOptions;
use rand::Rng;
use serde::{Serialize};

use crate::{Service, error::*};

#[derive(Serialize)]
struct QiniuUploadPolicy {
    scope: String,
    deadline: i64,
}

pub struct StorageService<'s> {
    options: &'s ServiceOptions,
    model: &'s Model,
    service: &'s Service,
}

impl<'s> StorageService<'s> {
    pub fn new(service: &'s Service) -> Self {
        Self {
            options: &service.option,
            model: &service.model,
            service,
        }
    }
    pub async fn new_random_name(&self) -> Result<String> {
        let count = self.model.storage().count().await?;
        
        let bits = core::mem::size_of::<usize>() * 8 - count.leading_zeros() as usize + 1;
        let chars = bits / 6;
        let chars = max(chars, 4);
        let bytes = (chars + 1) * 6 / 8;
        let mut buf: Vec<u8> = vec![0; bytes];
        for _ in 0..4 {
            self.service.rng.borrow_mut().fill(&mut buf[..]);
            let name = base64::encode_config(&buf, base64::URL_SAFE);
            if self.model.storage().add_new_key(&name).await? {
                return Ok(name[0..chars].to_owned());
            } else {
                log::warn!("Name conflict '{}'", &name);
            }
        }
        Err(Error::InternalServiceError("Name conflict too many times."))
    }
    pub async fn qiniu_token(&self) -> Result<String> {

        let policy = QiniuUploadPolicy {
            scope: "sardineimg".to_owned(),
            deadline: (Utc::now() + Duration::minutes(5)).timestamp(),
        };
        let json = serde_json::to_string(&policy)
            .map_err(|_|Error::InternalServiceError("Failed to serialize policy"))?;
        let encoded_policy = base64::encode_config(&json, base64::URL_SAFE);
        let sign = hmacsha1::hmac_sha1(self.options.qiniu_secretkey.as_bytes(), encoded_policy.as_bytes());
        let sign = base64::encode_config(&sign, base64::URL_SAFE);
        let token = format!("{}:{}:{}",
            &self.options.qiniu_accesskey,
            &sign,
            &encoded_policy
        );

        Ok(token)
    }
}