#![allow(warnings, dead_code)]
use std::env::{self, args};

use chrono::Local;
use futures_util::{StreamExt, future::ready};
use import_mysql::import_mysql;
use mongodb::{bson::{Bson, doc}, options::FindOptions};
use mysql::{Pool, chrono::{self, DateTime, NaiveDate, NaiveDateTime, TimeZone, Utc, naive}, prelude::Queryable, serde_json, time::PrimitiveDateTime};
use mysql::serde::Deserialize;
use model::{Access, AuthenticationInfo, Blog, BlogContent, CommentContent, DocType, HashMethod, HistoryData, MiscellaneousPostContent, Model, Note, NoteContent, Operation, PidType, Post, PostStats, PostType, User, UserInfo};
use shared::ServiceOptions;
use tokio::macros;

mod config;
mod import_mysql;



#[tokio::main]
async fn main() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug")).init();

    let path = env::args().skip(1).next().unwrap();

    let json = std::str::from_utf8(&std::fs::read(path).unwrap()).unwrap().to_owned();
    let config: config::Config = serde_json::from_str(&json).unwrap();

    let opts: ServiceOptions = serde_json::from_str(&json).unwrap();
    let model = Model::open(&opts).await.unwrap();

    model.init(false).await.unwrap();

    let db = mongodb::Client::with_uri_str(&opts.db_addr).await.unwrap().database(&opts.db_name);

    if config.import_mysql {
        let pool = Pool::new(&config.mysql_url).unwrap();
        let mut conn = pool.get_conn().unwrap();
        import_mysql(&config, &mut conn, &model).await;
    }
    
    if config.rebuild_search_index {
        log::info!("Rebuilding search index");
        model.search.init_index().await.unwrap();
        let query = doc! {
            "pid": { "$ne": Bson::Null }
        };
        let pid_list = db.collection("post")
            .find(query, FindOptions::builder().projection(doc! {
                "pid": 1,
                "_id": 0
            }).build())
            .await
            .unwrap()
            .filter_map(|result| ready(result.ok()
                .and_then(|doc| doc.get_i32("pid").ok())))
            .collect::<Vec::<_>>()
            .await;
        
        for pid in pid_list {
            log::info!("Fetch {}", pid);
            let post = model.post.get_raw_by_pid(pid).await.unwrap();
            match &post.data {
                PostType::Blog(_) | PostType::Note(_) => {
                    let author = model.user.get_by_uid(&post.uid).await.unwrap();
                    model.search.insert_post(&post, author.info.name).await.unwrap();
                    log::info!("Indexed Post {} by {}", pid, author.uid);
                }
                _ => (),
            }
        }
    }
}

