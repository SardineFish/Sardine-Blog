use std::ops::Deref;

use serde::Deserialize;

#[derive(Deserialize)]
pub struct PageQueryParams<const N: usize> {
    #[serde(default)]
    pub from: usize,
    #[serde(default)]
    pub count: ElementCount<N>,
}

#[derive(Deserialize)]
pub struct ElementCount<const N: usize>(usize);

impl<const N: usize> Deref for ElementCount<N> {
    type Target = usize;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<const N: usize> Default for ElementCount<N> {
    fn default() -> Self {
        Self(N)
    }
}