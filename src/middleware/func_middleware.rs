use actix_http::body::{MessageBody, BoxBody};
use actix_web::{
    dev::{Service, Transform, ServiceRequest, ServiceResponse},
};
use futures_util::future::{ok, Ready, Future};
use tokio::sync::Mutex;
use std::{marker::PhantomData, task::{
    self,
    Poll
}};
use std::pin::Pin;
use std::rc::Rc;

pub trait ServiceT<B> = Service<ServiceRequest, Response = ServiceResponse<B>, Error = actix_web::Error>;
// pub trait MiddlewareClosure = FnMut<>
pub type AsyncMiddlewareRtn<B> = Pin<Box<dyn Future<Output = Result<ServiceResponse<B>, actix_web::Error>>>>;

pub type SyncService<S> = &'static S;

#[derive(Clone)]
pub struct FuncMiddleware<S, F, Func> {
    func: Func,
    _s: PhantomData<S>,
    _f: PhantomData<F>,
}

impl<S, B, F, Func> FuncMiddleware<S, F, Func>
where
    S: ServiceT<B> + 'static,
    S::Future: 'static,
    B: MessageBody,
    Func: FnMut(ServiceRequest, SyncService<S>) -> F + 'static,
    F: Future<Output = Result<ServiceResponse<B>, actix_web::Error>>
{
    pub fn from_func(func: Func) -> Self{
        Self {
            func,
            _s: Default::default(),
            _f: Default::default(),
        }
    }
}

impl<S, B, F, Func: FnMut(ServiceRequest, SyncService<S>) -> F + Copy + 'static> Transform<S, ServiceRequest> for FuncMiddleware<S, F, Func>
where
    S: ServiceT<B> + 'static,
    S::Future: 'static,
    B: MessageBody,
    F: Future<Output = Result<ServiceResponse<B>, actix_web::Error>> + 'static
{
    type Response = ServiceResponse<B>;
    type Error = actix_web::Error;
    type InitError = ();
    type Transform = FuncMiddlewareFuture<S, F, Func>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;
    fn new_transform(&self, service: S) -> Self::Future {
        ok(FuncMiddlewareFuture {
            func: self.func,
            service,
        })
    }
}

pub struct FuncMiddlewareFuture<S: 'static, F, Func: FnMut(ServiceRequest, SyncService<S>) -> F + 'static> {
    func: Func,
    service: S,
}

impl<S, B, F, Func: FnMut(ServiceRequest, SyncService<S>) -> F + Copy + 'static> Service<ServiceRequest> for FuncMiddlewareFuture<S, F, Func>
where
    S: ServiceT<B> + 'static,
    S::Future: 'static,
    B: MessageBody, 
    F: Future<Output = Result<ServiceResponse<B>, actix_web::Error>> + 'static
{
    type Response = ServiceResponse<B>;
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;
    fn poll_ready(&self, ctx: &mut task::Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(ctx)
    }
    fn call(&self, req: ServiceRequest) -> Self::Future {
        let service = unsafe {
            &*((&self.service) as *const S)
        };
        let mut func = self.func;
        let fut = func(req, service);
        Box::pin(async move {
            let result = fut.await?;
            Ok(result)
        })
    }
}

pub fn _test_func<S>(num: i32) -> FuncMiddleware<S, AsyncMiddlewareRtn<BoxBody>, impl FnMut(ServiceRequest, SyncService<S>) -> AsyncMiddlewareRtn<BoxBody> + Copy>
    where
            S: ServiceT<BoxBody> + 'static,
            S::Future: 'static 
{
    FuncMiddleware::<S, AsyncMiddlewareRtn<BoxBody>, _>::from_func(move |req, srv| {
        Box::pin(async move {
            log::debug!("{}", num);
            srv.call(req).await 
        })
    })
}



macro_rules! async_middleware {
    (pub $name: ident, $async_func: ident) => {
        pub fn $name<S>() -> self::FuncMiddleware<S, AsyncMiddlewareRtn<actix_http::body::BoxBody>, impl FnMut(ServiceRequest, SyncService<S>) -> AsyncMiddlewareRtn<actix_http::body::BoxBody> + Copy>
        where
            S: ServiceT<actix_http::body::BoxBody> + 'static,
            S::Future: 'static,
        {
            self::FuncMiddleware::<S, AsyncMiddlewareRtn<actix_http::body::BoxBody>, _>::from_func(move |req, srv| {
                Box::pin(async move {
                    $async_func(req, srv).await
                })
            })
        }
    };
    (pub fn $name: ident ($($param: ident $colon: tt $type: ty,)*), $func: ident ($($invoke_param: expr,)*)) => {
        pub fn $name<S>($($param $colon $type, )*) -> self::FuncMiddleware<S, AsyncMiddlewareRtn<actix_http::body::BoxBody>, impl FnMut(ServiceRequest, SyncService<S>) -> AsyncMiddlewareRtn<actix_http::body::BoxBody> + Copy>
        where
            S: ServiceT<actix_http::body::BoxBody> + 'static,
            S::Future: 'static,
        {
            self::FuncMiddleware::<S, AsyncMiddlewareRtn<actix_http::body::BoxBody>, _>::from_func(move |req, srv| {
                Box::pin(async move {
                    $func(req, srv, $($invoke_param,)*).await
                })
            })
        }
    };
    (pub fn $name: ident ($param: ident $colon: tt $type: ty), $func: ident ($invoke_param: expr)) => {
        async_middleware!(pub fn $name($param $colon $type,), $func($invoke_param,));
    };
}
 