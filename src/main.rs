#![feature(trait_alias)]

use actix_web::{self, App, HttpServer, get, middleware::Logger, web};

mod controller;
mod middleware;
mod misc;
use misc::error;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug")).build();

    let opts = options::ServiceOptions::default();
    let service = sar_blog::Service::open(opts.clone()).await.unwrap();

    HttpServer::new(move || {
        App::new()
            .data(service.clone())
            .wrap(middleware::error_formatter())
            .wrap(Logger::default())
            .configure(controller::config)
    })
    .bind(&opts.listen)?
    .run()
    .await?;

    Ok(())
}
