use model::{PidType, PostDoc, PostType, PostTypeName};
use shared::ServiceOptions;

use crate::error::*;
use crate::Service;

pub struct UrlService<'s> {
    service: &'s Service,
    options: &'s ServiceOptions,
}

impl<'s> UrlService<'s> {
    pub fn new(service: &'s Service) -> Self {
        Self {
            service,
            options: &service.option,
        }
    }

    pub fn homepage(&self) -> String {
        format!("{}/", self.options.site_url)
    }

    pub fn blog(&self, pid: PidType) -> String {
        format!("{}/blog/{}", self.options.site_url, pid)
    }

    pub fn note(&self, pid: PidType) -> String {
        format!("{}/note/{}", self.options.site_url, pid)
    }

    pub fn recipe(&self, pid: PidType) -> String {
        format!("{}/cook/{}", self.options.site_url, pid)
    }

    pub fn gallery(&self, pid: PidType) -> String {
        format!("{}/gallery/{}", self.options.site_url, pid)
    }

    pub fn unsubscribe_notification(&self, uid: &str) -> String {
        format!("{}/notification/unsubscribe/{}", self.options.site_url, uid)
    }

    pub async fn url_from_pid(&self, pid: PidType) -> Result<String> {
        let post = self.service.model.post.get_raw_by_pid(pid).await?;
        self.url_from_post(&post).await
    }

    pub async fn url_from_post(&self, post: &PostDoc) -> Result<String> {
        match &post.data {
            PostType::Blog(_) => Ok(self.blog(post.pid)),
            PostType::Note(_) => Ok(self.note(post.pid)),
            PostType::Recipe(_) => Ok(self.recipe(post.pid)),
            PostType::Exhibit(_) => Ok(self.gallery(post.pid)),
            PostType::Miscellaneous(content) => Ok(content.url.to_owned()),
            PostType::Comment(content) => {
                let post_type = self
                    .service
                    .model
                    .post
                    .get_type(content.comment_root)
                    .await?;
                match post_type {
                    PostTypeName::Blog => Ok(self.blog(content.comment_root)),
                    PostTypeName::Note => Ok(self.note(content.comment_root)),
                    PostTypeName::Exhibit => Ok(self.gallery(content.comment_root)),
                    PostTypeName::Miscellaneous => {
                        let root_post = self
                            .service
                            .model
                            .post
                            .get_raw_by_pid(content.comment_root)
                            .await?;
                        if let PostType::Miscellaneous(content) = root_post.data {
                            Ok(content.url)
                        } else {
                            Err(Error::InternalServiceError("Invalid post type"))
                        }
                    }
                    PostTypeName::Comment => {
                        Err(Error::InternalServiceError("Invalid comment root"))
                    }
                }
            }
        }
    }
}
