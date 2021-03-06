use chrono::Local;
use futures_util::{StreamExt, future::ready};
use mongodb::{bson::{Bson, doc}, options::FindOptions};
use mysql::{Pool, chrono::{self, DateTime, NaiveDate, NaiveDateTime, TimeZone, Utc, naive}, prelude::Queryable, serde_json, time::PrimitiveDateTime};
use mysql::serde::Deserialize;
use model::{Access, AuthenticationInfo, Blog, BlogContent, CommentContent, DocType, HashMethod, HistoryData, MiscellaneousPostContent, Model, Note, NoteContent, Operation, PidType, Post, PostStats, PostType, User, UserInfo};
use shared::ServiceOptions;
use tokio::macros;

use super::config::Config;

pub async fn import_mysql(config: &Config, conn: &mut mysql::PooledConn, model: &Model) {
    if config.import_user {
        let users = conn.query_map(r"SELECT uid, name, pwd, encryption, email, url, level, icon, operation, time FROM `user_data` WHERE `ignore` = 0 ORDER BY time", 
        |(uid, name, pwd, encryption, email, url, level, icon, operation, time ):
         (String, String, String, String, String, String, String, Option<String>, String, String)| {
            log::info!("Get uid '{:?}'", &uid);
            let time = NaiveDateTime::parse_from_str(&time, "%Y-%m-%d %H:%M:%S")
                .ok()
                .unwrap_or(NaiveDateTime::parse_from_str("2015-08-12 00:00:00", "%Y-%m-%d %H:%M:%S").unwrap());

            let user = User {
                uid,
                access: match level.as_str() {
                    "developer" => Access::Owner,
                    "admin" => Access::Trusted,
                    "default" => Access::Registered,
                    "visitor" => Access::Anonymous,
                    _ => Access::Visitor,
                },
                auth_info: AuthenticationInfo {
                    method: match encryption.as_str() {
                        "SHA1" => HashMethod::SHA1,
                        "MD5" => HashMethod::MD5,
                        _ => HashMethod::NoLogin,
                    },
                    password_hash: pwd,
                    salt: "".to_owned(),
                },
                info: UserInfo {
                    name,
                    avatar: icon.and_then(url_or_none).unwrap_or("https://cdn-static.sardinefish.com/img/decoration/unknown-user.png".to_owned()),
                    email: email_or_none(email),
                    url: url_or_none(url)
                },
            };

            (user, time)
        }).unwrap();

        for (user, time) in users {
            let result = model.user.add(&user).await;
            if let Err(err) = result {
                log::warn!("{}", err);
            }
            let local_time = chrono_tz::Asia::Shanghai.from_local_datetime(&time).unwrap();
            let utc_time = local_time.with_timezone(&Utc);

            log::info!("{} -> {}", time, utc_time);

            model.history.record_with_time("root", model::Operation::Snapshot, HistoryData::User(user), utc_time)
                .await
                .unwrap();
        }
    }
    
    if config.import_blog {
        let blogs = conn.query_map(
        r#"
SELECT article.pid, title, tags, docType, encode, document, author, time, `operate`, `ignore`,
    `views`.value as `views`, `comments`.value as `comments`
FROM `article` 
LEFT JOIN post_data `views` on `views`.pid = article.pid and `views`.key = 'browse'
LEFT JOIN post_data `comments` on `comments`.pid = article.pid and `comments`.key = 'comment'
LEFT JOIN post_data `likes` on `likes`.pid = article.pid and `likes`.key = 'like'
        "#,
        |(pid, title, tags, doc_type, encode, mut doc, uid, time, operation, ignore, views, comments): 
            (PidType, String, String, String, String, String, String, NaiveDateTime, String, bool, Option<i32>, Option<i32>)|{
                log::info!("Get blog with pid '{}'", pid);
            
                if encode == "custom" {
                    doc = doc.replace("%27", "'")
                        .replace("%22", "\"")
                        .replace("%5c", "\\")
                        .replace("%25", "%");
                }
            
                let local_time = chrono_tz::Asia::Shanghai.from_local_datetime(&time).unwrap();
                let utc_time = local_time.with_timezone(&Utc);
                let mut post = Post::new(pid, PostType::Blog(BlogContent {
                    doc_type: match doc_type.as_str() {
                        "text" => model::DocType::PlainText,
                        "markdown" => model::DocType::Markdown,
                        "html" => model::DocType::HTML,
                        _ => model::DocType::PlainText,
                    },
                    title,
                    doc,
                    tags: tags.split(",").map(|slice| slice.to_owned()).collect(),
                }), &uid);
                post.time = utc_time.into();
                post.stats = PostStats {
                    views: views.unwrap_or(0) as usize,
                    comments: comments.unwrap_or(0) as usize,
                    likes: 0
                };
                let operation = match operation.as_str() {
                    "created" => Operation::Create,
                    "edited" => Operation::Update,
                    "deleted" => Operation::Delete,
                    _ => Operation::Snapshot,
                };
                (post, operation, ignore)
            }).unwrap();
            
        for (post, op, ignore) in blogs {
        
            if !ignore {
                let result = model.post.insert(&post).await;
                if let Err(err) = result {
                    log::warn!("{}", err);
                }
            } else {
                log::info!("Ignore blog of pid '{}'", post.pid);
            }
        
            log::info!("Record history {:?} of pid '{}'", op, post.pid);
            model.history.record_with_time(&post.uid, op, (post.pid, post.data), post.time.into())
                    .await.unwrap();
        }
    }
    

    if config.import_note {
        let notes = conn.query_map(r#"
SELECT note.pid, text, author, time, `operate`, `ignore`,
    `views`.value as `views`, `comments`.value as `comments`, `likes`.value as `likes` 
FROM `note` 
LEFT JOIN post_data `views` on `views`.pid = note.pid and `views`.key = 'browse'
LEFT JOIN post_data `comments` on `comments`.pid = note.pid and `comments`.key = 'comment'
LEFT JOIN post_data `likes` on `likes`.pid = note.pid and `likes`.key = 'like'
        "#, |(pid, mut text, uid, time, operate, ignore, views, comments, likes): 
            (PidType, String, String, String, String, bool, Option<i32>, Option<i32>, Option<i32>)| {

                log::info!("Get note of pid '{}'", pid);

                let mut note = Post::new(pid, PostType::Note(NoteContent {
                    doc: text,
                    doc_type: match pid {
                        x if x <= 352 => model::DocType::HTML,
                        _ => DocType::PlainText,
                    },
                }), &uid);

                let time = NaiveDateTime::parse_from_str(&time, "%Y-%m-%d %H:%M:%S")
                    .ok()
                    .unwrap_or(NaiveDateTime::parse_from_str("2015-08-12 00:00:00", "%Y-%m-%d %H:%M:%S").unwrap());
                let local_time = chrono_tz::Asia::Shanghai.from_local_datetime(&time).unwrap();
                let utc_time = local_time.with_timezone(&Utc);

                note.time = utc_time.into();
                note.stats = PostStats {
                    views: views.unwrap_or(0) as usize,
                    comments: comments.unwrap_or(0) as usize,
                    likes: likes.unwrap_or(0) as usize,
                };

                let operation = match operate.as_str() {
                    "created" => Operation::Create,
                    "edited" => Operation::Update,
                    "deleted" => Operation::Delete,
                    _ => Operation::Snapshot,
                };

                (note, operation, ignore)
            }).unwrap();

        for (post, op, ignore) in notes {
            if !ignore {
                if let Err(err) = model.post.insert(&post).await {
                    log::warn!("Error when adding note of pid '{}': {}", post.pid, err);
                }
            } else {
                log::info!("Ignore note of pid '{}'", post.pid);
            }

            log::info!("Record history {:?} of pid '{}'", op, post.pid);
            model.history.record_with_time(&post.uid, op, (post.pid, post.data), post.time.into())
                    .await.unwrap();
        }
    }
    

    if config.import_comment {
        let comments = conn.query_map(r#"
SELECT comment.pid, cid, root_pid, uid, text, notified, time, operate, `ignore`,
    `comments`.value as `comments` 
FROM `comment` 
LEFT JOIN post_data `views` on `views`.pid = comment.pid and `views`.key = 'browse'
LEFT JOIN post_data `comments` on `comments`.pid = Comment.pid and `comments`.key = 'comment'
LEFT JOIN post_data `likes` on `likes`.pid = comment.pid and `likes`.key = 'like'
        "#, |(pid, cid, root_pid, uid, text, notified, time, operate, ignore, comments):
        (PidType, PidType, PidType, String, String, bool, String, String, bool, Option<i32>)| {
            log::info!("Get comment of pid '{}' cid '{}' root '{}'", pid, cid, root_pid);
            let mut post = Post::new(pid, PostType::Comment(CommentContent {
                comment_root: root_pid,
                comment_to: cid,
                text: text,
                notified: notified,
            }), &uid);

            let time = NaiveDateTime::parse_from_str(&time, "%Y-%m-%d %H:%M:%S")
                .ok()
                .unwrap_or(NaiveDateTime::parse_from_str("2015-08-12 00:00:00", "%Y-%m-%d %H:%M:%S").unwrap());
            let local_time = chrono_tz::Asia::Shanghai.from_local_datetime(&time).unwrap();
            let utc_time = local_time.with_timezone(&Utc);
            post.time = utc_time.into();

            post.stats = PostStats {
                views: 0,
                comments: comments.unwrap_or(0) as usize,
                likes: 0
            };

            let operation = match operate.as_str() {
                    "created" => Operation::Create,
                    "edited" => Operation::Update,
                    "deleted" => Operation::Delete,
                    _ => Operation::Snapshot,
                };

            (post, operation, ignore)
        }).unwrap();

        for (post, op, ignore) in comments {
            if !ignore {
                if let Err(err) = model.post.insert(&post).await {
                    log::warn!("Error when adding comment of pid '{}': {}", post.pid, err);
                }
            } else {
                log::info!("Ignore comment of pid '{}'", post.pid);
            }

            log::info!("Record history {:?} of pid '{}'", op, post.pid);
            model.history.record_with_time(&post.uid, op, (post.pid, post.data), post.time.into())
                    .await.unwrap();
        }
    }
    

    if config.import_stats {
        let reg = regex::Regex::new(r"^(browse|like|comment) (note|article|comment)([1-9]|[1-9][0-9]+)$").unwrap();

        let stats = conn.query_map(r#"SELECT * FROM `statistics`"#, |(index, key, value): (i32, String, i32)| {
            if key == "visited" {
                log::info!("Get home visits {}", value);
                (0 as PidType, "views", value as usize)
            } else {
                if let Some(caps) = reg.captures(&key) {
                    if let (Some(action), Some(post_type), Some(pid)) = (caps.get(1), caps.get(2), caps.get(3)) {
                        log::info!("Get {} {} {} = {}", post_type.as_str(), pid.as_str(), action.as_str(), value);
                        match action.as_str() {
                            "browse" => (pid.as_str().parse::<PidType>().unwrap(), "views", value as usize),
                            "like" => (pid.as_str().parse::<PidType>().unwrap(), "likes", value as usize),
                            "comment" => (pid.as_str().parse::<PidType>().unwrap(), "comments", value as usize),
                            _ => (-1 as PidType, "", 0 as usize)
                        }
                    } else {
                        (-1 as PidType, "", 0 as usize)
                    }
                } else {
                    log::warn!("Unmatched key '{}'", &key);
                    (-1 as PidType, "", 0 as usize)
                }
            }

        }).unwrap();

        for (pid, action, value) in stats {
            if pid == 0 {
                let mut stats = if let Ok(stats) = model.post.get_stats(pid).await {
                    stats
                } else {
                    log::info!("Create pid 0");
                    let post = Post::new(0, PostType::Miscellaneous(MiscellaneousPostContent {
                        name: "Home Page".to_owned(),
                        description: "Post stats for home page".to_owned(),
                        url: "https://www.sardinefish.com/".to_owned(),
                    }), "SardineFish");
                    model.post.insert(&post)
                        .await
                        .unwrap();
                    post.stats
                };
                log::info!("Set home page views {}", value);
                stats.views = value;
                model.post.set_stats(0, &stats).await.unwrap();
            } else if pid < 0 {
                continue
            } else {
                if let Ok(mut stats) = model.post.get_stats(pid).await {
                    match action {
                        "views" => stats.views = value,
                        "likes" => stats.likes = value,
                        "comments" => stats.comments = value,
                        _ => (),
                    }
                    model.post.set_stats(pid, &stats).await.unwrap();
                } else {
                    log::warn!("Post of pid '{}' not found.", pid);
                }
            }
        }

        let post = Post::new(1, PostType::Miscellaneous(MiscellaneousPostContent {
            name: "About".to_owned(),
            description: "Post stats for about page".to_owned(),
            url: "https://www.sardinefish.com/about/".to_owned(),
        }), "SardineFish");
        if let Err(err) = model.post.insert(&post).await {
            log::warn!("Failed to create misc post for about page: {}", err);
        }
    }
    

    if config.reset_pid {
        let result = conn.query_map(r"SELECT pid from posts ORDER BY pid DESC LIMIT 1", |pid: i32| {
            pid
        }).unwrap();
        log::info!("Reset base pid to {}", result[0]);
        model.post.reset_pid_base(result[0]).await.unwrap();
    }

    if config.import_score {
        let result = conn.query_map(r"SELECT game,uid,score,`time` FROM `score` WHERE `ignore`=0", 
        |(key, name, score, time): (String, String, i64, String)| {

            let time = NaiveDateTime::parse_from_str(&time, "%Y-%m-%d %H:%M:%S")
                .ok()
                .unwrap_or(NaiveDateTime::parse_from_str("2015-08-12 00:00:00", "%Y-%m-%d %H:%M:%S").unwrap());
            let local_time = chrono_tz::Asia::Shanghai.from_local_datetime(&time).unwrap();
            let utc_time = local_time.with_timezone(&Utc);

            (key, name, score, utc_time)
        }).unwrap();
        log::info!("Fetched {} scores", result.len());
        for (key, name, score, time) in result {
            model.rank.add_ranked_score(&key, &name, score, time).await.unwrap();
        }
    }
}

fn url_or_none(url: String) -> Option<String> {
    if url::Url::parse(&url).is_ok() {
        Some(url)
    } else {
        None
    }
}
fn email_or_none(addr: String) -> Option<String> {
    if email_address_parser::EmailAddress::is_valid(&addr, None) {
        Some(addr)
    } else {
        None
    }
}