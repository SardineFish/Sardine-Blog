#![feature(trait_alias)]
#![feature(or_patterns)]

use actix_web::{self, App, HttpServer, middleware::Logger};

mod controller;
mod middleware;
mod misc;

use misc::error;
use misc::utils;
use misc::error_report::ServiceMornitor;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug")).init();

    let matches = clap::App::new("Sardine Blog NG")
        .author("SardineFish")
        .about("SardineFish's personal website backend server.")
        .version("0.1.0")
        .arg("--init 'Initialize database.'")
        .arg("-c --config=[CONFIG_FILE] 'Service configure JSON file.'")
        .get_matches();

    let opts = if let Some(path) = matches.value_of("config") {
        let json = std::fs::read_to_string(path).expect("Failed to open config file");
        serde_json::de::from_str(&json).unwrap()
    } else {
        options::ServiceOptions::default()
    };

    let opts_moved = opts.clone();
    let service = sar_blog::Service::open(opts.clone()).await.unwrap();

    ServiceMornitor::init(&opts, service.clone());
    
    if matches.is_present("init") {
        service.init_database().await.unwrap();
    }

    HttpServer::new( move || {
        App::new()
            .data(opts_moved.clone())
            .data(service.clone())
            .wrap(Logger::new("%s - %r %Dms"))
            .configure(controller::config(opts_moved.clone()))
    })
    .bind(&opts.listen)?
    .run()
    .await?;

    Ok(())
}
