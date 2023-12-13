use actix_http::{
    self,
    header::{self, HeaderName},
    Method,
};

use crate::misc::response::CORSAccessControl;

pub struct AnyGet;
impl CORSAccessControl for AnyGet {
    fn allow_origin_default() -> Option<&'static str> {
        Some("*")
    }
    fn allow_methods_default() -> Option<Vec<Method>> {
        Some(vec![Method::GET])
    }
}
impl Default for AnyGet {
    fn default() -> Self {
        AnyGet
    }
}

pub struct AnyPostJson;
impl CORSAccessControl for AnyPostJson {
    fn allow_origin_default() -> Option<&'static str> {
        Some("*")
    }
    fn allow_methods_default() -> Option<Vec<Method>> {
        Some(vec![Method::POST])
    }
    fn allow_headers_default() -> Option<Vec<HeaderName>> {
        Some(vec![header::CONTENT_TYPE])
    }
}
impl Default for AnyPostJson {
    fn default() -> Self {
        AnyPostJson
    }
}
