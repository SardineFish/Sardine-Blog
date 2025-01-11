use actix_web::{
    get,
    web::{self},
};
use rss::{
    extension::atom::{self, AtomExtensionBuilder},
    CategoryBuilder, GuidBuilder,
};
use sar_blog::{model::ExhibitContent, BlogPreview, PubPostData};
use web::{Query, ServiceConfig};

use crate::{
    controller::utils::{add_read_more_link, get_copyright, PageQueryParams},
    error::*,
    misc::response::{Response, RssFeed},
};

use super::extractor;

use Response::Ok;

const RFC_822_FORMAT: &str = "%a, %d %b %Y %H:%M:%S %z";
const LOGO_URL: &str = "/api/user/SardineFish/avatar";

#[get("/blog/feed")]
pub async fn get_blog_rss_feed(
    service: extractor::Service,
    Query(params): Query<PageQueryParams<10>>,
) -> Response<RssFeed> {
    let blog_preview = service
        .blog()
        .get_preview_list::<BlogPreview>(params.from, *params.count)
        .await
        .map_contoller_result()?;

    let feed_items = blog_preview
        .into_iter()
        .map(|blog| {
            rss::ItemBuilder::default()
                .title(blog.title)
                .link(service.url().blog(blog.pid))
                .description(add_read_more_link(
                    &blog.preview,
                    &service.url().blog(blog.pid),
                ))
                .author(blog.author.name)
                .pub_date(blog.time.format(RFC_822_FORMAT).to_string())
                .guid(
                    rss::GuidBuilder::default()
                        .value(service.url().blog(blog.pid))
                        .permalink(true)
                        .build(),
                )
                .categories(
                    blog.tags
                        .into_iter()
                        .map(|tag| CategoryBuilder::default().name(tag).build())
                        .collect::<Vec<_>>(),
                )
                .build()
        })
        .collect::<Vec<_>>();

    let next_page = service.url().site_url(format!(
        "/blog/feed?{}",
        params.next_page().to_query_string()
    ));

    let feed = rss::ChannelBuilder::default()
        .title("SardineFish Blog")
        .link(service.url().homepage())
        .description("SardineFish's personal blog")
        .language("zh-cn".to_owned())
        .image(
            rss::ImageBuilder::default()
                .url(service.url().site_url(LOGO_URL))
                .link(service.url().homepage())
                .build(),
        )
        .copyright(get_copyright())
        .items(feed_items)
        .atom_ext(
            AtomExtensionBuilder::default()
                .link(atom::Link {
                    rel: "next".to_owned(),
                    href: next_page,
                    ..Default::default()
                })
                .build(),
        )
        .build();

    Ok(RssFeed(feed))
}

fn get_preview_image_url(url: &str) -> String {
    format!("{url}-s600")
}

fn add_image_preview(content: &str, img: &str) -> String {
    format!(
        r#"{content}
<br>
<img src="{}">
"#,
        get_preview_image_url(img)
    )
}

#[get("/gallery/feed")]
pub async fn get_gallery_feed(
    service: extractor::Service,
    Query(query): Query<PageQueryParams<20>>,
) -> Response<RssFeed> {
    let data = service
        .gallery()
        .get_preview_list::<PubPostData<ExhibitContent>>(query.from, *query.count)
        .await?;

    let feed_items = data
        .into_iter()
        .map(|item| {
            rss::ItemBuilder::default()
                .title(item.content.title)
                .link(service.url().gallery(item.pid))
                .pub_date(item.time.format(RFC_822_FORMAT).to_string())
                .guid(
                    GuidBuilder::default()
                        .value(service.url().gallery(item.pid))
                        .permalink(true)
                        .build(),
                )
                .description(add_image_preview(
                    &item.content.description,
                    &item.content.url,
                ))
                .itunes_ext(
                    rss::extension::itunes::ITunesItemExtensionBuilder::default()
                        .image(get_preview_image_url(&item.content.url))
                        .build(),
                )
                .build()
        })
        .collect::<Vec<_>>();

    let next_page = format!(
        "{}/gallery/feed?{}",
        service.option.site_url,
        query.next_page().to_query_string()
    );

    let feed = rss::ChannelBuilder::default()
        .title("SardineFish Gallery")
        .link(service.url().homepage())
        .description("SardineFish's photography gallery")
        .language("zh-cn".to_owned())
        .image(
            rss::ImageBuilder::default()
                .url(service.url().site_url(LOGO_URL))
                .link(service.url().homepage())
                .build(),
        )
        .copyright(get_copyright())
        .items(feed_items)
        .atom_ext(
            AtomExtensionBuilder::default()
                .link(atom::Link {
                    rel: "next".to_owned(),
                    href: next_page,
                    ..Default::default()
                })
                .build(),
        )
        .build();

    Ok(RssFeed(feed))
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(get_blog_rss_feed).service(get_gallery_feed);
}
