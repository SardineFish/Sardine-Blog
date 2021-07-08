use model::SearchResult;

use crate::Service;
use crate::error::Result;

pub struct SearchService<'s> {
    service: &'s Service,
}

impl<'s> SearchService<'s> {
    pub(super) fn new(service: &'s Service) -> Self {
        Self {
            service,
        }
    }

    pub async fn search(&self, query: &str, skip: usize, count: usize) -> Result<SearchResult> {
        Ok(self.service.model.search.search(query, skip, count).await?)
    }
}