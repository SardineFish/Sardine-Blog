use actix_web::web::{scope, Json, Path, ServiceConfig};
use actix_web::{get, post, web::Query};
use sar_blog::model::{Access, PidType, RecipeContent};
use sar_blog::PubPostData;

use super::extractor::*;
use crate::misc::response::Response;

use super::utils::PageQueryParams;
use crate::middleware;

use Response::Ok;

#[get("")]
async fn get_recipes(
    service: Service,
    query: Query<PageQueryParams<100>>,
) -> Response<Vec<PubPostData<RecipeContent>>> {
    let data = service
        .cook()
        .get_preview_list::<PubPostData<RecipeContent>>(query.from, *query.count)
        .await?;
    Ok(data)
}

#[post("", wrap = "middleware::authentication(Access::Trusted)")]
async fn post_recipe(service: Service, auth: Auth, data: Json<RecipeContent>) -> Response<PidType> {
    Ok(service.cook().post(&auth.uid, data.into_inner()).await?)
}

#[post("/{pid}", wrap = "middleware::authentication(Access::Trusted)")]
async fn update_recipe(
    service: Service,
    auth: Auth,
    pid: Path<PidType>,
    data: Json<RecipeContent>,
) -> Response<PidType> {
    service
        .cook()
        .update(*pid, &auth.uid, data.into_inner())
        .await?;
    Ok(*pid)
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/cook")
            .service(get_recipes)
            .service(post_recipe)
            .service(update_recipe),
    );
}