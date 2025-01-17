use std::{
    ops::{Deref, DerefMut},
    usize,
};

use bson::{doc, Document};
use chrono::Utc;
use futures::{future::ready, StreamExt};
use mongodb::{
    bson::{self, oid::ObjectId},
    options::{FindOneAndUpdateOptions, FindOneOptions, ReturnDocument, UpdateOptions},
    Collection, Cursor, Database,
};
use shared::md2plain::{html2plain, md2plain, slice_utf8};

use crate::{
    error::*, model::PidType, BlogContent, CommentContent, DocType, NoteContent, PubUserInfo,
};
use crate::{misc::usize_format, User};

use serde::{de::DeserializeOwned, Deserialize, Serialize};
use shared::error::LogError;

use super::{gallery::ExhibitContent, recipe::RecipeContent, search::IndexDoc};

const COLLECTION_POST: &str = "post";
// const COLLECTION_META: &str = "meta";

#[derive(Serialize, Deserialize)]
struct PostMetaData {
    pub _id: ObjectId,
    pub posts: PidType,
}

#[allow(dead_code)]
fn query(pid: PidType) -> Document {
    doc! {
        "pid": pid
    }
}

#[allow(dead_code)]
#[allow(clippy::upper_case_acronyms)]
pub enum SortOrder {
    ASC = 1,
    DESC = -1,
}

#[derive(Serialize, Deserialize, Default, Clone)]
pub struct PostStats {
    #[serde(with = "usize_format")]
    pub likes: usize,
    #[serde(with = "usize_format")]
    pub views: usize,
    #[serde(with = "usize_format")]
    pub comments: usize,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct MiscellaneousPostContent {
    pub name: String,
    pub description: String,
    pub url: String,
}

impl PostData for MiscellaneousPostContent {
    fn post_type_name() -> &'static str {
        "Miscellaneous"
    }

    fn wrap(self) -> PostType {
        PostType::Miscellaneous(self)
    }

    fn unwrap(data: PostType) -> Option<Self> {
        match data {
            PostType::Miscellaneous(data) => Some(data),
            _ => None,
        }
    }

    fn ignore_fields_on_preview() -> &'static [&'static str] {
        &[]
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub enum PostTypeName {
    Note,
    Blog,
    Comment,
    Miscellaneous,
    Exhibit,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "content")]
pub enum PostType {
    Note(NoteContent),
    Blog(BlogContent),
    Comment(CommentContent),
    Recipe(RecipeContent),
    Miscellaneous(MiscellaneousPostContent),
    Exhibit(ExhibitContent),
}

impl PostType {
    pub fn type_name(&self) -> &'static str {
        match self {
            PostType::Blog(_) => BlogContent::post_type_name(),
            PostType::Note(_) => NoteContent::post_type_name(),
            PostType::Comment(_) => CommentContent::post_type_name(),
            PostType::Recipe(_) => RecipeContent::post_type_name(),
            PostType::Miscellaneous(_) => MiscellaneousPostContent::post_type_name(),
            PostType::Exhibit(_) => ExhibitContent::post_type_name(),
        }
    }
}

#[derive(Deserialize, Clone)]
pub struct Post<T: PostData> {
    pub pid: PidType,
    pub uid: String,
    pub time: bson::DateTime,
    pub stats: PostStats,
    pub author: PubUserInfo,

    #[serde(flatten, bound = "T: PostData")]
    pub content: T,
}

impl<T: PostData> Post<T> {
    pub fn new(pid: PidType, author: &User, content: T) -> Self {
        Self {
            pid,
            time: Utc::now().into(),
            stats: PostStats::default(),
            author: author.into(),
            uid: author.uid.clone(),
            content,
        }
    }
}

impl<T: PostData> PostMeta for Post<T> {
    fn pid(&self) -> PidType {
        self.pid
    }
    fn stats(&self) -> &PostStats {
        &self.stats
    }
    fn author_uid(&self) -> &str {
        &self.uid
    }
}

impl<T: PostData> GenericPost for Post<T> {
    type Content = T;

    fn post_type_name() -> &'static str {
        T::post_type_name()
    }

    fn ignore_fields_on_preview() -> &'static [&'static str] {
        T::ignore_fields_on_preview()
    }
}

impl<T: PostData> Deref for Post<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.content
    }
}

impl<T: PostData> DerefMut for Post<T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.content
    }
}

pub trait PostMeta {
    fn pid(&self) -> PidType;
    fn stats(&self) -> &PostStats;
    fn author_uid(&self) -> &str;
}

pub trait GenericPost: PostMeta + DeserializeOwned + Clone + Unpin + Send + Sync + 'static {
    type Content: PostData;
    fn post_type_name() -> &'static str;

    fn ignore_fields_on_preview() -> &'static [&'static str];
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PostDoc {
    pub(crate) _id: ObjectId,
    pub pid: PidType,
    pub uid: String,
    pub time: bson::DateTime,
    pub stats: PostStats,
    pub data: PostType,
}

impl PostDoc {
    pub fn new(pid: PidType, post: PostType, author: &str) -> Self {
        Self {
            _id: ObjectId::new(),
            pid,
            uid: author.to_string(),
            time: Utc::now().into(),
            stats: Default::default(),
            data: post,
        }
    }
}

impl<T: PostData> From<Post<T>> for PostDoc {
    fn from(post: Post<T>) -> Self {
        Self {
            _id: ObjectId::new(),
            pid: post.pid,
            time: post.time,
            stats: post.stats,
            uid: post.uid,
            data: post.content.wrap(),
        }
    }
}

impl PostMeta for PostDoc {
    fn pid(&self) -> PidType {
        self.pid
    }

    fn stats(&self) -> &PostStats {
        &self.stats
    }

    fn author_uid(&self) -> &str {
        &self.uid
    }
}

pub trait PostData:
    Serialize + DeserializeOwned + Clone + Sized + Unpin + Send + Sync + 'static
{
    const ALLOW_SEARCH: bool = false;
    fn post_type_name() -> &'static str;
    fn wrap(self) -> PostType;
    fn unwrap(data: PostType) -> Option<Self>;
    fn search_index(&self) -> Option<IndexDoc> {
        None
    }
    fn ignore_fields_on_preview() -> &'static [&'static str];
}

pub fn get_content_preview(doc_type: DocType, content: &str, limit: usize) -> String {
    match doc_type {
        DocType::HTML => slice_utf8(&html2plain(content), limit).to_owned(),
        DocType::Markdown => md2plain(content, limit),
        DocType::PlainText => slice_utf8(content, limit).to_owned(),
    }
}

#[derive(Clone)]
pub struct PostModel {
    collection: Collection<PostDoc>,
    #[allow(unused)]
    coll_meta: Collection<PostMetaData>,
    update_options: FindOneAndUpdateOptions,
    meta_id: ObjectId,
}

impl PostModel {
    pub fn new(db: &Database) -> Self {
        let mut opts = FindOneAndUpdateOptions::default();
        opts.return_document = Some(mongodb::options::ReturnDocument::After);

        Self {
            collection: db.collection(COLLECTION_POST),
            update_options: opts,
            coll_meta: db.collection(COLLECTION_POST),
            meta_id: ObjectId::from_bytes([0; 12]),
        }
    }

    pub async fn init_meta(&self) -> Result<()> {
        let data = PostMetaData {
            _id: self.meta_id,
            posts: 0,
        };

        self.coll_meta
            .insert_one(&data, None)
            .await
            .map_model_result()?;

        Ok(())
    }

    pub async fn init_collection(db: &Database) {
        db.run_command(
            doc! {
                "createIndexes": COLLECTION_POST,
                "indexes": [
                    {
                        "key": {
                            "pid": 1,
                        },
                        "name": "idx_pid",
                        "unique": true,
                    },
                ],
            },
            None,
        )
        .await
        .log_warn_consume("init-db-post");
        db.run_command(
            doc! {
                "createIndexes": COLLECTION_POST,
                "indexes": [
                    {
                        "key": {
                            "data.type": 1,
                            "time": -1,
                        },
                        "name": "idx_type_time",
                    },
                ],
            },
            None,
        )
        .await
        .log_warn_consume("init-db-post");
        db.run_command(
            doc! {
                "createIndexes": COLLECTION_POST,
                "indexes": [
                    {
                        "key": {
                            "data.content.comment_root": 1,
                        },
                        "name": "idx_comment_root",
                    },
                ],
            },
            None,
        )
        .await
        .log_warn_consume("init-db-post");
        db.run_command(
            doc! {
                "createIndexes": COLLECTION_POST,
                "indexes": [
                    {
                        "key": {
                            "time": -1,
                        },
                        "name": "idx_time",
                    },
                ],
            },
            None,
        )
        .await
        .log_warn_consume("init-db-post");
    }

    pub async fn reset_pid_base(&self, pid: PidType) -> Result<()> {
        let query = doc! {
            "_id": &self.meta_id,
        };
        let update = doc! {
            "$set": {
                "posts": pid
            }
        };
        self.collection
            .find_one_and_update(query, update, None)
            .await?
            .expect("Missing Metadata");

        Ok(())
    }

    pub async fn new_post<T: PostData>(&self, content: T, author: &User) -> Result<Post<T>> {
        let query = doc! {
            "_id": &self.meta_id,
        };
        let update = doc! {
            "$inc": {
                "posts": 1i32
            }
        };

        let mut opts = FindOneAndUpdateOptions::default();
        opts.return_document = Some(ReturnDocument::After);
        let metadata = self
            .coll_meta
            .find_one_and_update(query, update, Some(opts))
            .await
            .map_model_result()?
            .expect("Missing Metadata");

        let pid = metadata.posts;

        Ok(Post::new(pid, author, content))
    }

    pub async fn new_post_legacy(&self, post_type: PostType, uid: &str) -> Result<PostDoc> {
        let query = doc! {
            "_id": &self.meta_id,
        };
        let update = doc! {
            "$inc": {
                "posts": 1i32
            }
        };

        let mut opts = FindOneAndUpdateOptions::default();
        opts.return_document = Some(ReturnDocument::After);
        let metadata = self
            .coll_meta
            .find_one_and_update(query, update, Some(opts))
            .await
            .map_model_result()?
            .expect("Missing Metadata");

        let pid = metadata.posts;

        Ok(PostDoc::new(pid, post_type, uid))
    }

    pub async fn insert(&self, post: &PostDoc) -> Result<()> {
        let query = doc! {
            "pid": post.pid
        };
        let update = doc! {
            "$setOnInsert": bson::to_bson(&post).map_model_result()?
        };
        let mut opts = UpdateOptions::default();
        opts.upsert = Some(true);
        let result = self
            .collection
            .update_one(query, update, opts)
            .await
            .map_model_result()?;
        if result.upserted_id.is_none() {
            Err(Error::PostExisted(post.pid))
        } else {
            Ok(())
        }
    }

    pub async fn delete<T: PostData>(&self, pid: PidType) -> Result<Option<T>> {
        let query = doc! {
            "pid": pid
        };
        let doc = self
            .collection
            .find_one_and_delete(query, None)
            .await
            .map_model_result()?
            .and_then(|doc| T::unwrap(doc.data));

        Ok(doc)
    }

    pub async fn update_content<T: PostData>(&self, pid: PidType, content: &T) -> Result<()> {
        let query = doc! {
            "pid": pid
        };
        let update = doc! {
            "$set": {
                "data.content": bson::to_bson(&content).map_model_result()?
            }
        };
        self.collection
            .find_one_and_update(query, update, None)
            .await
            .map_model_result()?;
        Ok(())
    }

    pub async fn get_raw_by_pid(&self, pid: PidType) -> Result<PostDoc> {
        let query = doc! {
            "pid": pid
        };
        self.collection
            .find_one(query, None)
            .await
            .map_model_result()?
            .ok_or(Error::PostNotFound(pid))
    }

    pub async fn get_preview_list<T: GenericPost>(
        &self,
        skip: usize,
        limit: usize,
    ) -> Result<Vec<T>> {
        self.get_list(T::ignore_fields_on_preview(), skip, limit)
            .await
    }

    pub async fn get_full_list<T: GenericPost>(&self, skip: usize, limit: usize) -> Result<Vec<T>> {
        self.get_list(&[], skip, limit).await
    }

    async fn get_list<T: GenericPost>(
        &self,
        ignore_fields: &[&str],
        skip: usize,
        limit: usize,
    ) -> Result<Vec<T>> {
        let query = doc! {
            "data.type": T::post_type_name()
        };
        let result: Vec<T> = Self::get_flat_posts(
            &self.collection,
            query,
            ignore_fields,
            skip,
            limit,
            Some(("time", SortOrder::DESC)),
        )
        .await?
        .filter_map(|d| {
            ready(d.ok().and_then(|doc| {
                let result = bson::from_document::<T>(doc);
                if let Err(err) = &result {
                    log::warn!(
                        "Error when deserializing a {}: {}",
                        T::post_type_name(),
                        err
                    );
                }
                result.ok()
            }))
        })
        .collect()
        .await;
        Ok(result)
    }

    pub async fn get_post_by_pid<T: GenericPost>(&self, pid: PidType) -> Result<T> {
        let query = doc! {
            "pid": pid,
            "data.type": T::post_type_name()
        };

        let doc = Self::get_flat_posts(&self.collection, query, &[], 0, 1, None)
            .await?
            .next()
            .await
            .ok_or(Error::PostNotFound(pid))?
            .map_model_result()?;

        bson::from_document(doc).map_model_result()
    }

    pub async fn like(&self, pid: PidType) -> Result<usize> {
        let post = self.increase_stats(pid, "likes").await?;
        Ok(post.stats.likes)
    }

    pub async fn dislike(&self, pid: PidType) -> Result<usize> {
        let post = self.decrease_stats(pid, "likes").await?;
        Ok(post.stats.likes)
    }

    pub async fn view(&self, pid: PidType) -> Result<usize> {
        let post = self.increase_stats(pid, "views").await?;
        Ok(post.stats.views)
    }

    pub async fn add_comment(&self, pid: PidType) -> Result<usize> {
        let post = self.increase_stats(pid, "comments").await?;
        Ok(post.stats.comments)
    }

    pub async fn get_stats(&self, pid: PidType) -> Result<PostStats> {
        let post = self.get_raw_by_pid(pid).await?;
        Ok(post.stats)
    }

    pub async fn set_stats(&self, pid: PidType, stats: &PostStats) -> Result<()> {
        let query = doc! {
            "pid": pid
        };
        let update = doc! {
            "$set": {
                "stats": bson::to_bson(&stats).map_model_result()?
            }
        };
        self.collection
            .update_one(query, update, None)
            .await
            .map_model_result()?;

        Ok(())
    }

    pub async fn get_type(&self, pid: PidType) -> Result<PostTypeName> {
        let query = doc! {
            "pid": pid,
        };
        let mut opts = FindOneOptions::default();
        opts.projection = Some(doc! {
            "data.type": 1i32
        });
        let result = self
            .collection
            .clone_with_type::<Document>()
            .find_one(query, opts)
            .await?
            .ok_or(Error::PostNotFound(pid))?
            .get_document_mut("data")?
            .remove("type")
            .ok_or(Error::InternalError("Missing field 'type'"))?;
        bson::from_bson(result).map_model_result()
    }

    async fn increase_stats(&self, pid: PidType, key: &str) -> Result<PostDoc> {
        let query = doc! {
            "pid": pid
        };
        let update = doc! {
            "$inc": {
                format!("stats.{}", key): 1i32
            }
        };
        let mut options = FindOneAndUpdateOptions::default();
        options.return_document = Some(mongodb::options::ReturnDocument::After);
        self.collection
            .find_one_and_update(query, update, self.update_options.clone())
            .await
            .map_model_result()?
            .ok_or(Error::PostNotFound(pid))
    }

    async fn decrease_stats(&self, pid: PidType, key: &str) -> Result<PostDoc> {
        let query = doc! {
            "pid": pid
        };
        let update = doc! {
            "$inc": {
                format!("stats.{}", key): -1i32
            }
        };
        let mut options = FindOneAndUpdateOptions::default();
        options.return_document = Some(mongodb::options::ReturnDocument::After);
        self.collection
            .find_one_and_update(query, update, self.update_options.clone())
            .await
            .map_model_result()?
            .ok_or(Error::PostNotFound(pid))
    }

    pub(crate) async fn get_flat_posts<T>(
        collection: &Collection<T>,
        filter: bson::Document,
        ignore_fields: &[&str],
        skip: usize,
        limit: usize,
        sort: Option<(&str, SortOrder)>,
    ) -> Result<Cursor<Document>> {
        log::debug!("Get post at {}+{}", skip, limit);

        let mut pipeline: Vec<bson::Document> = Vec::new();
        pipeline.push(doc! {
            "$match": filter,
        });

        // Build ignore fields
        if !ignore_fields.is_empty() {
            let mut map = bson::Document::new();
            for field in ignore_fields {
                map.insert(format!("data.content.{}", field), 0);
            }
            pipeline.push(doc! {
                "$project": &map
            });
        }

        if let Some((name, order)) = sort {
            pipeline.push(doc! {
                "$sort" : {
                    name: order as i32
                }
            });
        }

        pipeline.push(doc! {
            "$skip": skip as i32
        });
        pipeline.push(doc! {
            "$limit": limit as i32
        });

        // Join with user info
        pipeline.push(doc! {
            "$lookup": {
                "from": "user",
                "let": {
                    "uid": "$uid",
                },
                "pipeline": [{
                    "$match": {
                        "$expr": {
                            "$eq": ["$uid", "$$uid"]
                        }
                    }
                }],
                "as": "user_info"
            }
        });

        // Flatten post data
        pipeline.push(doc! {
            "$replaceRoot": {
                "newRoot": {
                    "$mergeObjects": [
                        "$data.content",
                        {
                            "pid": "$pid",
                            "uid": "$uid",
                            "time": "$time",
                            "stats": "$stats",
                            "author": {
                                "$arrayElemAt": ["$user_info.info", 0i32]
                            },
                        }
                    ]
                }
            }
        });

        // Remove private user info
        pipeline.push(doc! {
            "$unset": ["author.email"]
        });

        collection
            .aggregate(pipeline, None)
            .await
            .map_model_result()
    }
}
