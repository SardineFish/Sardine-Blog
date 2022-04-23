use model::{Post, PostData, SearchResult};

use crate::error::Result;
use crate::Service;

pub struct SearchService<'s> {
    service: &'s Service,
}

impl<'s> SearchService<'s> {
    pub(super) fn new(service: &'s Service) -> Self {
        Self { service }
    }

    pub async fn search(&self, query: &str, skip: usize, count: usize) -> Result<SearchResult> {
        Ok(self.service.model.search.search(query, skip, count).await?)
    }

    pub async fn index<T: PostData>(&self, post: &Post<T>) -> Result<()> {
        if self.service.option.enable_indexing {
            self.service.model.search.insert_post(post).await?;
        }
        Ok(())
    }
}
