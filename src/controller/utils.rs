use std::ops::Deref;

use chrono::Datelike;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct PageQueryParams<const N: usize> {
    #[serde(default)]
    pub from: usize,
    #[serde(default)]
    pub count: ElementCount<N>,
}

impl<const N: usize> PageQueryParams<N> {
    pub fn next_page(&self) -> Self {
        Self {
            from: self.from + *self.count,
            count: self.count,
        }
    }

    pub fn to_query_string(&self) -> String {
        format!("from={}&count={}", self.from, *self.count)
    }
}

#[derive(Deserialize, Clone, Copy)]
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

pub fn add_read_more_link(content: &str, url: &str) -> String {
    format!(r#"{content}... <br><a href="{url}">Read more...</a>"#)
}

pub fn get_copyright() -> String {
    let year = chrono::Local::now().year();
    format!("Copyright 2015-{year} SardineFish. All rights reserved.")
}
