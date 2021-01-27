use actix_web::{self, App, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug")).build();

    let addr = "localhost:3000";

    HttpServer::new(move || App::new())
        .bind(addr)?
        .run()
        .await?;


    Ok(())
}
