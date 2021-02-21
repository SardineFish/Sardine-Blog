use actix_http::body::Body;
use actix_web::{
    dev::{Service, Transform, ServiceRequest, ServiceResponse, MessageBody},
};
use futures_util::future::{ok, Ready, Future};
use tokio::sync::Mutex;
use std::{marker::PhantomData, task::{
    self,
    Poll
}};
use std::pin::Pin;
use std::rc::Rc;

pub trait ServiceT<B> = Service<Request = ServiceRequest, Response = ServiceResponse<B>, Error = actix_web::Error>;
// pub trait MiddlewareClosure = FnMut<>
pub type AsyncMiddlewareRtn<B> = Pin<Box<dyn Future<Output = Result<ServiceResponse<B>, actix_web::Error>>>>;

pub type SyncService<S> = Rc<Mutex<S>>;

#[derive(Clone)]
pub struct FuncMiddleware<S, F, Func: FnMut(ServiceRequest, SyncService<S>) -> F> {
    func: Func,
    _s: PhantomData<S>,
    _f: PhantomData<F>,
}

impl<S, B, F, Func: FnMut(ServiceRequest, SyncService<S>) -> F> FuncMiddleware<S, F, Func>
where
    S: ServiceT<B> + 'static,
    S::Future: 'static,
    B: MessageBody,
    F: Future<Output = Result<ServiceResponse<B>, actix_web::Error>>
{
    pub fn from_func(func: Func) -> Self{
        Self {
            func: func,
            _s: Default::default(),
            _f: Default::default(),
        }
    }
}

impl<S, B, F, Func: FnMut(ServiceRequest, SyncService<S>) -> F + Copy + 'static> Transform<S> for FuncMiddleware<S, F, Func>
where
    S: ServiceT<B> + 'static,
    S::Future: 'static,
    B: MessageBody,
    F: Future<Output = Result<ServiceResponse<B>, actix_web::Error>> + 'static
{
    type Request = ServiceRequest;
    type Response = ServiceResponse<B>;
    type Error = actix_web::Error;
    type InitError = ();
    type Transform = FuncMiddlewareFuture<S, F, Func>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;
    fn new_transform(&self, service: S) -> Self::Future {
        ok(FuncMiddlewareFuture {
            func: self.func,
            service: Rc::new(Mutex::new(service)),
        })
    }
}

pub struct FuncMiddlewareFuture<S, F, Func: FnMut(ServiceRequest, SyncService<S>) -> F> {
    func: Func,
    service: SyncService<S>,
}

impl<S, B, F, Func: FnMut(ServiceRequest, SyncService<S>) -> F + Copy + 'static> Service for FuncMiddlewareFuture<S, F, Func>
where
    S: ServiceT<B> + 'static,
    S::Future: 'static,
    B: MessageBody, 
    F: Future<Output = Result<ServiceResponse<B>, actix_web::Error>> + 'static
{
    type Request = ServiceRequest;
    type Response = ServiceResponse<B>;
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;
    fn poll_ready(&mut self, ctx: &mut task::Context<'_>) -> Poll<Result<(), Self::Error>> {
        if let Ok(mut guard) = self.service.try_lock() {
            guard.poll_ready(ctx)
        } else {
            Poll::Pending
        }
    }
    fn call(&mut self, req: Self::Request) -> Self::Future {
        let service = self.service.clone();
        let mut func = self.func;
        Box::pin(async move {
            let result = func(req, service).await?;
            Ok(result)
        })
    }
}

pub fn _test_func<S>(num: i32) -> FuncMiddleware<S, AsyncMiddlewareRtn<Body>, impl FnMut(ServiceRequest, SyncService<S>) -> AsyncMiddlewareRtn<Body> + Copy>
    where
            S: ServiceT<Body> + 'static,
            S::Future: 'static 
{
    FuncMiddleware::<S, AsyncMiddlewareRtn<Body>, _>::from_func(move |req, srv| {
        Box::pin(async move {
            log::debug!("{}", num);
            let mut t = srv.lock().await;
            t.call(req).await 
        })
    })
}



macro_rules! async_middleware {
    (pub $name: ident, $async_func: ident) => {
        pub fn $name<S>() -> self::FuncMiddleware<S, AsyncMiddlewareRtn<Body>, impl FnMut(ServiceRequest, SyncService<S>) -> AsyncMiddlewareRtn<Body> + Copy>
        where
            S: ServiceT<Body> + 'static,
            S::Future: 'static,
        {
            self::FuncMiddleware::<S, AsyncMiddlewareRtn<Body>, _>::from_func(move |req, srv| {
                Box::pin(async move {
                    $async_func(req, srv).await
                })
            })
        }
    };
    (pub fn $name: ident ($($param: ident $colon: tt $type: ty,)*), $func: ident ($($invoke_param: expr,)*)) => {
        pub fn $name<S>($($param $colon $type, )*) -> self::FuncMiddleware<S, AsyncMiddlewareRtn<Body>, impl FnMut(ServiceRequest, SyncService<S>) -> AsyncMiddlewareRtn<Body> + Copy>
        where
            S: ServiceT<Body> + 'static,
            S::Future: 'static,
        {
            self::FuncMiddleware::<S, AsyncMiddlewareRtn<Body>, _>::from_func(move |req, srv| {
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
 