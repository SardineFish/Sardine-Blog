use actix_web::{HttpRequest, dev::{Service, Transform, ServiceRequest, ServiceResponse, MessageBody}};
use futures_util::future::{ok, Ready, Future};
use std::task::{
    self,
    Poll
};
use std::pin::Pin;
use std::rc::Rc;
use std::cell::{RefCell};

pub trait ServiceT = Service<ServiceRequest, Response = ServiceResponse, Error = actix_web::Error>;
pub type AsyncMiddlewareRtn = Pin<Box<dyn Future<Output = Result<ServiceResponse, actix_web::Error>>>>;

#[derive(Clone)]
pub struct FuncMiddleware<S, F> {
    func: fn(req: ServiceRequest, service: Rc<RefCell<S>>) -> F,
}

impl<S, F> FuncMiddleware<S, F>
where
    S: ServiceT + 'static,
    S::Future: 'static,
    F: Future<Output = Result<ServiceResponse, actix_web::Error>>
{
    pub fn from_func(func: fn(req: ServiceRequest, service: Rc<RefCell<S>>) -> F) -> Self{
        Self {
            func: func
        }
    }
}

impl<S, F> Transform<S, ServiceRequest> for FuncMiddleware<S, F>
where
    S: ServiceT + 'static,
    S::Future: 'static,
    F: Future<Output = Result<ServiceResponse, actix_web::Error>> + 'static
{
    type Response = ServiceResponse;
    type Error = actix_web::Error;
    type InitError = ();
    type Transform = FuncMiddlewareFuture<S, F>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;
    fn new_transform(&self, service: S) -> Self::Future {
        ok(FuncMiddlewareFuture {   
            func: self.func,
            service: Rc::new(RefCell::new(service)),
        })
    }
}

pub struct FuncMiddlewareFuture<S, F> {
    func: fn(req: ServiceRequest, service: Rc<RefCell<S>>) -> F,
    service: Rc<RefCell<S>>,
}

impl<S, F> Service<ServiceRequest> for FuncMiddlewareFuture<S, F>
where
    S: ServiceT + 'static,
    S::Future: 'static,
    F: Future<Output = Result<ServiceResponse, actix_web::Error>> + 'static
{
    type Response = ServiceResponse;
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;
    fn poll_ready(&mut self, ctx: &mut task::Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(ctx)
    }
    fn call(&mut self, req: ServiceRequest) -> Self::Future {
        let service = self.service.clone();
        let func = self.func;
        Box::pin(async move {
            let result = func(req, service).await?;
            Ok(result)
        })
    }
}


macro_rules! async_middleware {
    (pub $name: ident, $async_func: ident) => {
        pub fn $name<S>() -> self::FuncMiddleware<S, AsyncMiddlewareRtn>
        where
            S: ServiceT + 'static,
            S::Future: 'static,
        {
            self::FuncMiddleware::from_func(move |req, srv| {
                Box::pin(async move {
                    $async_func(req, srv).await
                })
            })
        }
    };
}