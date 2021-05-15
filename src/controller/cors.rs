use actix_http::http::{HeaderName, Method, header};

use crate::misc::response::CORSAccessControl;

pub enum CORS {
    AnyPostJson,
    AnyGet,
}

impl CORSAccessControl for CORS {
    fn allow_origin(&self) -> Option<&str> {
        match self {
            CORS::AnyGet | CORS::AnyPostJson => Some("*"),
        }
    }
    fn allow_methods(&self) -> Option<Vec<Method>> {
        match self {
            CORS::AnyGet => Some(vec![Method::GET]),
            CORS::AnyPostJson => Some(vec![Method::POST])
        }
    }
    fn allow_headers(&self) -> Option<Vec<HeaderName>> {
        match self {
            CORS::AnyPostJson => Some(vec![header::CONTENT_TYPE]),
            _ => None,
        }
    }
}