#![feature(trait_alias)]
#![feature(try_trait_v2)]
#![feature(never_type)]

use actix_web::{self, App, HttpServer, dev::Server, middleware::Logger, web::{self, JsonConfig}};

mod controller;
mod middleware;
mod misc;

use misc::error;
use misc::utils;
use misc::error_report::ServiceMornitor;
use shared::ServiceOptions;
use sar_blog::{MessageMail, Service};
use misc::error::OkOrLog;

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
        shared::ServiceOptions::default()
    };

    let service = sar_blog::Service::open(opts.clone()).await
        .expect("Failed to start service");

    ServiceMornitor::init(&opts, service.clone());
    
    if matches.is_present("init") || opts.db_init {
        service.init_database(true).await.unwrap();
        // exit(0);
    }

    service.push_service().send_message(&opts.report_address, MessageMail {
        title: "Server Start Running".to_owned(),
        content: format!("Server was started at {}", chrono::Utc::now().to_rfc3339())
    }).await.ok_or_error("Failed to send startup message");


    let server = config_server(opts.clone(), service.clone())?;
    server.await?;


    service.push_service().send_message(&opts.report_address, MessageMail {
        title: "Server Shutdown".to_owned(),
        content: format!("Server was shutdown at {}", chrono::Utc::now().to_rfc3339())
    }).await.ok_or_error("Failed to send shutdown message");

    Ok(())
}

fn config_server(options: ServiceOptions, service: Service) -> std::io::Result<Server> {
    let opt_moved = options.clone();
    let server = HttpServer::new(move  || {
        App::new()
            .data(opt_moved.clone())
            .data(service.clone())
            .data(web::PayloadConfig::new(3 * 1024 * 1024))
            .data(JsonConfig::default().limit(1 * 1024 * 1024))
            .wrap(Logger::new("%s - %r %Dms"))
            .configure(controller::config(opt_moved.clone()))
    })
    .workers(options.workers)
    .bind(&options.listen)?
    .run();
    Ok(server)
}