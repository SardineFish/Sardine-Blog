use actix_web::web::{scope, Json, Path, ServiceConfig};
use actix_web::{delete, get, post, put, web::Query};
use sar_blog::model::{Access, ExhibitContent, PidType};
use sar_blog::PubPostData;

use super::extractor::*;
use crate::misc::response::Response;

use super::utils::PageQueryParams;
use crate::middleware;

use Response::Ok;

#[get("")]
async fn get_gallery_list(
    service: Service,
    query: Query<PageQueryParams<100>>,
) -> Response<Vec<PubPostData<ExhibitContent>>> {
    let data = service
        .gallery()
        .get_preview_list::<PubPostData<ExhibitContent>>(query.from, *query.count)
        .await?;
    Ok(data)
}

#[get("/{pid}")]
async fn get_exhibit(
    service: Service,
    session: Session,
    pid: Path<PidType>,
) -> Response<PubPostData<ExhibitContent>> {
    let data = service
        .gallery()
        .get_by_pid(&session.session_id, *pid)
        .await?;
    Ok(data.into())
}

#[post("", wrap = "middleware::authentication(Access::Trusted)")]
async fn post_exhibit(
    service: Service,
    auth: Auth,
    data: Json<ExhibitContent>,
) -> Response<PidType> {
    Ok(service.gallery().post(&auth.uid, data.into_inner()).await?)
}

#[put("/{pid}", wrap = "middleware::authentication(Access::Trusted)")]
async fn update_exhibit(
    service: Service,
    auth: Auth,
    pid: Path<PidType>,
    data: Json<ExhibitContent>,
) -> Response<PidType> {
    service
        .gallery()
        .update(*pid, &auth.uid, data.into_inner())
        .await?;
    Ok(*pid)
}

#[delete("/{pid}", wrap = "middleware::authentication(Access::Owner)")]
async fn delete_exhibit(
    service: Service,
    auth: Auth,
    pid: Path<PidType>,
) -> Response<Option<ExhibitContent>> {
    Ok(service.gallery().delete(&auth.uid, *pid).await?)
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/gallery")
            .service(get_gallery_list)
            .service(get_exhibit)
            .service(post_exhibit)
            .service(update_exhibit)
            .service(delete_exhibit),
    );
}
