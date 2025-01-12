use actix_http::Method;
use actix_web::{
    dev::HttpServiceFactory,
    web::{self},
};
use rss::{
    extension::atom::{self, AtomExtensionBuilder},
    CategoryBuilder, ChannelBuilder, ItemBuilder,
};
use sar_blog::{
    model::{BlogContent, ExhibitContent, PostData},
    BlogPreview, PubPostData, Service,
};
use web::{Query, ServiceConfig};

use crate::{
    controller::utils::{add_read_more_link, make_copyright, PageQueryParams},
    middleware::{cache_request, CacheExpire},
    misc::response::{Response, RssFeed},
};

use super::extractor;

use Response::Ok;

const RFC_822_FORMAT: &str = "%a, %d %b %Y %H:%M:%S %z";
const LOGO_URL: &str = "/api/user/SardineFish/avatar";

trait RssFeedSource<T: PostData>: 'static {
    const FEED_ITEMS: usize = 10;

    fn title() -> &'static str;
    fn url() -> &'static str;
    fn description() -> &'static str;
    fn language() -> &'static str {
        "zh-cn"
    }
    fn build_channel<'a>(
        builder: &'a mut ChannelBuilder,
        service: &Service,
    ) -> &'a mut ChannelBuilder {
        builder
            .title(Self::title().to_owned())
            .link(service.url().site_url(Self::url()))
            .description(Self::description().to_owned())
            .language(Self::language().to_owned())
            .image(
                rss::ImageBuilder::default()
                    .url(service.url().site_url(LOGO_URL))
                    .link(service.url().homepage())
                    .title(Self::title().to_owned())
                    .build(),
            )
            .copyright(make_copyright())
    }
    fn item_title(post: &PubPostData<T>, service: &Service) -> String;
    fn item_description(post: &PubPostData<T>, service: &Service) -> String;
    fn item_url(post: &PubPostData<T>, service: &Service) -> String;
    fn item_readmore(post: &PubPostData<T>, service: &Service) -> bool;
    #[allow(unused)]
    fn item_categories(post: &PubPostData<T>, service: &Service) -> Vec<String> {
        Vec::new()
    }
    #[allow(unused)]
    fn item_image(post: &PubPostData<T>, service: &Service) -> Option<String> {
        None
    }
    fn build_item<'a>(
        builder: &'a mut ItemBuilder,
        post: &PubPostData<T>,
        service: &Service,
    ) -> &'a mut ItemBuilder {
        let item_url = Self::item_url(post, service);
        builder
            .title(Self::item_title(post, service))
            .link(item_url.clone())
            .description({
                let mut description = Self::item_description(post, service);

                if Self::item_readmore(post, service) {
                    description = add_read_more_link(&description, &item_url);
                }

                if let Some(img_url) = Self::item_image(post, service) {
                    description = append_img(&description, &img_url);
                }

                description
            })
            .author(post.author.name.to_owned())
            .pub_date(post.time.format(RFC_822_FORMAT).to_string())
            .guid(
                rss::GuidBuilder::default()
                    .value(item_url)
                    .permalink(true)
                    .build(),
            )
            .categories(
                Self::item_categories(post, service)
                    .into_iter()
                    .map(|tag| CategoryBuilder::default().name(tag).build())
                    .collect::<Vec<_>>(),
            )
    }

    async fn build_feed(
        service: extractor::Service,
        Query(query): Query<PageQueryParams<10>>,
    ) -> Response<RssFeed> {
        let mut builder = ChannelBuilder::default();

        let self_page =
            service
                .url()
                .site_url(format!("{}?{}", Self::url(), query.to_query_string()));
        let next_page = service.url().site_url(format!(
            "{}?{}",
            Self::url(),
            query.next_page().to_query_string()
        ));

        let feed = Self::build_channel(&mut builder, &service)
            .items(
                service
                    .post_service::<T>()
                    .get_preview_list::<PubPostData<T>>(query.from, *query.count)
                    .await?
                    .into_iter()
                    .map(|post| {
                        let mut builder = ItemBuilder::default();
                        Self::build_item(&mut builder, &post, &service);
                        if let Some(img_url) = Self::item_image(&post, &service) {
                            builder.itunes_ext(
                                rss::extension::itunes::ITunesItemExtensionBuilder::default()
                                    .image(img_url)
                                    .build(),
                            );
                        }
                        builder.build()
                    })
                    .collect::<Vec<_>>(),
            )
            .atom_ext(
                AtomExtensionBuilder::default()
                    .link(atom::Link {
                        rel: "next".to_owned(),
                        href: next_page,
                        ..Default::default()
                    })
                    .link(atom::Link {
                        rel: "self".to_owned(),
                        href: self_page,
                        ..Default::default()
                    })
                    .build(),
            )
            .build();

        Ok(RssFeed(feed))
    }

    fn web_service() -> impl HttpServiceFactory + 'static {
        web::resource(Self::url()).route(
            web::get()
                .method(Method::GET)
                .to(Self::build_feed)
                .wrap(cache_request("feed", Self::url(), CacheExpire::Never)),
        )
    }
}

fn get_preview_image_url(url: &str) -> String {
    format!("{url}-s600")
}

fn append_img(content: &str, img: &str) -> String {
    format!(
        r#"{content}
<br>
<img src="{img}">
"#
    )
}

struct BlogFeed;
impl RssFeedSource<BlogContent> for BlogFeed {
    fn title() -> &'static str {
        "SardineFish Blog"
    }

    fn url() -> &'static str {
        "/blog/feed"
    }

    fn description() -> &'static str {
        "SardineFish Blog"
    }

    fn item_title(post: &PubPostData<BlogContent>, _service: &Service) -> String {
        post.content.title.to_owned()
    }

    fn item_description(post: &PubPostData<BlogContent>, _service: &Service) -> String {
        BlogPreview::<300>::get_content_preview(post.content.doc_type, &post.content.doc)
    }

    fn item_url(post: &PubPostData<BlogContent>, service: &Service) -> String {
        service.url().blog(post.pid)
    }

    fn item_readmore(_post: &PubPostData<BlogContent>, _service: &Service) -> bool {
        true
    }

    fn item_categories(post: &PubPostData<BlogContent>, _service: &Service) -> Vec<String> {
        post.content.tags.clone()
    }
}

struct GalleryFeed;
impl RssFeedSource<ExhibitContent> for GalleryFeed {
    fn title() -> &'static str {
        "SardineFish Photography"
    }

    fn url() -> &'static str {
        "/gallery/feed"
    }

    fn description() -> &'static str {
        "SardineFish Photography Gallery"
    }

    fn item_title(post: &PubPostData<ExhibitContent>, _service: &Service) -> String {
        post.content.title.to_owned()
    }

    fn item_description(post: &PubPostData<ExhibitContent>, _service: &Service) -> String {
        let mut desc = BlogPreview::<300>::get_content_preview(
            sar_blog::model::DocType::PlainText,
            &post.content.description,
        );

        if post.content.is_album() {
            desc = format!("[{} Pics] {desc}", post.content.pic_count());
        }

        desc
    }

    fn item_url(post: &PubPostData<ExhibitContent>, service: &Service) -> String {
        service.url().gallery(post.pid)
    }

    fn item_readmore(_post: &PubPostData<ExhibitContent>, _service: &Service) -> bool {
        false
    }

    fn item_image(post: &PubPostData<ExhibitContent>, _service: &Service) -> Option<String> {
        Some(get_preview_image_url(&post.content.url))
    }
}

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(BlogFeed::web_service())
        .service(GalleryFeed::web_service());
}
