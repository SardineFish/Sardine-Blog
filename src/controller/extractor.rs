use actix_http::HttpMessage;
use futures_util::future::{err, ok};
use std::{
    any::type_name,
    ops::{Deref, DerefMut},
};

use actix_web::{dev::Payload, web, FromRequest, HttpRequest};
use futures::future::Ready;
use sar_blog::model::SessionAuthInfo;
use shared::ServiceOptions;

use crate::middleware;

pub struct ExtensionMove<T: ?Sized>(pub T);

impl<T: ?Sized> Deref for ExtensionMove<T> {
    type Target = T;
    fn deref(&self) -> &T {
        &self.0
    }
}

impl<T: ?Sized> DerefMut for ExtensionMove<T> {
    fn deref_mut(&mut self) -> &mut T {
        &mut self.0
    }
}

impl<T: Sized + 'static> FromRequest for ExtensionMove<T> {
    type Error = actix_web::Error;
    type Future = Ready<Result<Self, actix_web::Error>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        if let Some(t) = req.extensions_mut().remove::<T>() {
            ok(Self(t))
        } else {
            log::debug!(
                "Failed to extract extension. \
                Request path: {:?} (type: {})",
                req.path(),
                type_name::<T>(),
            );
            err(actix_web::error::ErrorInternalServerError(
                "Missing extension.",
            ))
        }
    }
}

pub type Service = web::Data<sar_blog::Service>;
pub type Session = ExtensionMove<middleware::Session>;
pub type Auth = ExtensionMove<SessionAuthInfo>;
pub type Options = web::Data<ServiceOptions>;
