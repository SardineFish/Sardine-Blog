#![feature(trait_alias)]
#![feature(try_trait_v2)]
#![feature(never_type)]

use actix_web::{
    self,
    dev::Server,
    middleware::Logger,
    web::{self, JsonConfig},
    App, HttpServer,
};

mod controller;
mod middleware;
mod misc;

use clap::arg;
use misc::error;
use misc::error::OkOrLog;
use misc::error_report::ServiceMornitor;
use misc::utils;
use sar_blog::{MessageMail, Service};
use shared::{LogError, ServiceOptions};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug")).init();

    let matches = clap::Command::new("Sardine Blog NG")
        .author("SardineFish")
        .about("SardineFish's personal website backend server.")
        .version("0.1.0")
        .arg(arg!(--init))
        .arg(arg!(-c --config [CONFIG] "Service configure JSON file."))
        .arg(arg!(--test))
        .get_matches();

    let opts = if let Some(path) = matches.value_of("config") {
        let json = std::fs::read_to_string(path).expect("Failed to open config file");
        serde_json::de::from_str(&json).unwrap()
    } else if let Ok(json) = std::fs::read_to_string("./config/config.json") {
        serde_json::de::from_str(&json).unwrap()
    } else {
        shared::ServiceOptions::default()
    };

    if matches.is_present("test") {
        env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug"))
            .try_init()
            .log_error_consume("log");
        sar_blog::Service::test(opts).await;
        return Ok(());
    }

    let service = sar_blog::Service::open(opts.clone())
        .await
        .expect("Failed to start service");

    ServiceMornitor::init(&opts, service.clone());

    if matches.is_present("init") || opts.db_init {
        service.init_database(true).await.unwrap();
        // exit(0);
    }

    service
        .push_service()
        .send_message(
            &opts.report_address,
            MessageMail {
                title: "Server Start Running".to_owned(),
                content: format!("Server was started at {}", chrono::Utc::now().to_rfc3339()),
            },
        )
        .await
        .ok_or_error("Failed to send startup message");

    let server = config_server(opts.clone(), service.clone())?;
    server.await?;

    service
        .push_service()
        .send_message(
            &opts.report_address,
            MessageMail {
                title: "Server Shutdown".to_owned(),
                content: format!("Server was shutdown at {}", chrono::Utc::now().to_rfc3339()),
            },
        )
        .await
        .ok_or_error("Failed to send shutdown message");

    Ok(())
}

fn config_server(options: ServiceOptions, service: Service) -> std::io::Result<Server> {
    let opt_moved = options.clone();
    let server = HttpServer::new(move || {
        App::new()
            .app_data(actix_web::web::Data::new(opt_moved.clone()))
            .app_data(actix_web::web::Data::new(service.clone()))
            .app_data(web::PayloadConfig::new(3 * 1024 * 1024))
            .app_data(JsonConfig::default().limit(2 * 1024 * 1024))
            .wrap(Logger::new("%s - %r %Dms"))
            .configure(controller::config(opt_moved.clone()))
    })
    .workers(options.workers)
    .bind(&options.listen)?
    .run();
    Ok(server)
}
