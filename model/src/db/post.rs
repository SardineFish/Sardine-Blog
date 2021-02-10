use std::{ usize};

use bson::{Document, doc, DateTime};
use chrono::Utc;
use mongodb::{Collection, Cursor, Database, bson::{self, oid::ObjectId}, options::{FindOneAndUpdateOptions, UpdateOptions}};
use tokio::stream::StreamExt;

use crate::{Blog, BlogContent, Comment, CommentContent, Note, NoteContent, error::*, model::PidType};
use crate::misc::usize_format;

use serde::{Serialize, Deserialize, de::DeserializeOwned};

const COLLECTION_POST: &str = "post";
const COLLECTION_META: &str = "meta";

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
pub enum SortOrder{
    ASC = 1,
    DESC = -1,
}


#[derive(Serialize, Deserialize, Default, Clone)]
pub struct PostStats {
    #[serde(with="usize_format")]
    pub likes: usize,
    #[serde(with="usize_format")]
    pub views: usize,
    #[serde(with="usize_format")]
    pub comments: usize,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "content")]
pub enum PostType {
    Note(NoteContent),
    Blog(BlogContent),
    Comment(CommentContent),
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Post {
    pub(crate) _id: ObjectId,
    pub pid: PidType,
    pub uid: String,
    pub time: DateTime,
    pub stats: PostStats,
    pub data: PostType,
}

impl Post {
    pub fn new(pid: PidType, post: PostType, author: &str) -> Self{
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

pub trait FlatPostData {
    fn post_type() -> &'static str;
}

impl FlatPostData for Blog{
    fn post_type() -> &'static str {
        "Blog"
    }
}
impl FlatPostData for Note{
    fn post_type() -> &'static str {
        "Note"
    }
}
impl FlatPostData for Comment{
    fn post_type() -> &'static str {
        "Comment"
    }
}

pub trait PostData {
    fn stats(&self) -> &PostStats;
    fn pid(&self) -> PidType;
}
impl PostData for Post {
    fn stats(&self) -> &PostStats {
        &self.stats
    }
    fn pid(&self) -> PidType {
        self.pid
    }
}
impl PostData for Blog {
    fn stats(&self) -> &PostStats {
        &self.stats
    }
    fn pid(&self) -> PidType {
        self.pid
    }
}
impl PostData for Note {
    fn stats(&self) -> &PostStats {
        &self.stats
    }
    fn pid(&self) -> PidType {
        self.pid
    }
}
impl PostData for Comment {
    fn stats(&self) -> &PostStats {
        &self.stats
    }
    fn pid(&self) -> PidType {
        self.pid
    }
}

pub trait PostContent {
    // fn from_post(post: Post) -> Result<Self>;
}

impl PostContent for BlogContent{}
impl PostContent for NoteContent{}
impl PostContent for CommentContent{}


#[derive(Clone)]
pub struct PostModel {
    collection: Collection,
    coll_meta: Collection,
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
            coll_meta: db.collection(COLLECTION_META),
            meta_id: ObjectId::with_bytes([0;12]),
        }
    }

    
    pub async fn init_meta(&self) -> Result<()> {
        let data = PostMetaData {
            _id: self.meta_id.clone(),
            posts: 0,
        };

        self.collection.insert_one(bson::to_document(&data).unwrap(), None)
            .await
            .map_model_result()?;

        Ok(())
    }
    
    pub async fn new_post(&self, post_type: PostType, uid: &str) -> Result<Post> {
        let query = doc! {
            "_id": &self.meta_id,
        };
        let update = doc!{
            "$inc": {
                "posts": 1
            }
        };

        let result = self.collection.find_one_and_update(query, update, None)
            .await
            .map_model_result()?
            .expect("Missing Metadata");

        let metadata: PostMetaData = bson::from_document(result).expect("Failed to deserialize metadata.");

        let pid = metadata.posts;

        Ok(Post::new(pid, post_type, uid))
    }

    pub async fn insert(&self, post: &Post) -> Result<()> {
        let query = doc! {
            "pid": post.pid
        };
        let update = doc! {
            "$setOnInsert": bson::to_bson(&post).map_model_result()?
        };
        let mut opts = UpdateOptions::default();
        opts.upsert = Some(true);
        let result = self.collection.update_one(query, update, opts)
            .await
            .map_model_result()?;
        if result.upserted_id.is_none() {
            Err(Error::PostExisted(post.pid))
        } else {
            Ok(())
        }
    }

    pub async fn delete<T: PostContent + DeserializeOwned>(&self, pid: PidType) -> Result<Option<T>> {
        let query = doc! {
            "pid": pid
        };
        let doc = self.collection.find_one_and_delete(query, None)
            .await
            .map_model_result()?;

        if let Some(mut doc) = doc {
            let content_doc= doc.remove("data").ok_or(Error::InternalError("Missing 'data' field in BSON"))?
                .as_document_mut().ok_or(Error::InternalError("Invalid 'data' field in BSON"))?
                .remove("content").ok_or(Error::InternalError("Missing 'content' field in BSON"))?;
            
            Ok(Some(bson::from_bson(content_doc).map_model_result()?))
        } else {
            Ok(None)
        }
    }

    pub async fn update_content<T: PostContent + Serialize + DeserializeOwned>(&self, pid: PidType, content: &T) -> Result<()> {
        let query = doc! {
            "pid": pid
        };
        let update = doc! {
            "$set": {
                "data.content": bson::to_bson(&content).map_model_result()?
            }
        };
        self.collection.find_one_and_update(query, update, None)
            .await
            .map_model_result()?;
        Ok(())
    }

    pub async fn get_raw_by_pid(&self, pid: PidType) -> Result<Post> {
        let query = doc!{
            "pid": pid
        };
        let doc = self.collection.find_one(query, None)
            .await
            .map_model_result()?
            .ok_or(Error::PostNotFound(pid))?;
        
        bson::from_document(doc).map_model_result()
    }

    pub async fn get_list<P: FlatPostData + DeserializeOwned>(&self, skip: usize, limit: usize) -> Result<Vec<P>> {
        let query = doc!{
            "data.type": P::post_type()
        };
        let result: Vec<P> = Self::get_flat_posts(&self.collection, query, skip, limit, Some(("time", SortOrder::DESC)))
            .await?
            .filter_map(|d| d.ok().and_then(|doc| {
                let result = bson::from_document::<P>(doc);
                if let Err(err) = &result {
                    log::warn!("Error when deserializing a {}: {}", P::post_type(), err);
                }
                result.ok()
            }))
            .collect()
            .await;
        Ok(result)
    }

    pub async fn get_post_by_pid<P : FlatPostData + DeserializeOwned>(&self, pid:PidType) -> Result<P> {
        let query = doc!{
            "pid": pid,
            "data.type": P::post_type()
        };

        let doc = Self::get_flat_posts(&self.collection, query, 0, 1, None)
            .await?
            .next().await
            .ok_or(Error::PostNotFound(pid))?
            .map_model_result()?;
            
        
        bson::from_document(doc).map_model_result()
    }
    
    pub async fn like(&self, pid: PidType) -> Result<usize> {   
        let post = self.increase_stats(pid, "likes").await?;
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

    async fn increase_stats(&self, pid: PidType, key: &str) -> Result<Post> {
        let query = doc! {
            "pid": pid
        };
        let update = doc! {
            "$inc": {
                format!("stats.{}", key): 1
            }
        };
        let mut options = FindOneAndUpdateOptions::default();
        options.return_document = Some(mongodb::options::ReturnDocument::After);
        let doc = self.collection.find_one_and_update(query, update, self.update_options.clone())
            .await
            .map_model_result()?
            .ok_or(Error::PostNotFound(pid))?;
        
        bson::from_document(doc).map_model_result()
    }

    pub(crate) async fn get_flat_posts(
        collection: &Collection, 
        filter: bson::Document, 
        skip: usize, 
        limit: usize,
        sort: Option<(&str,SortOrder)>
    ) -> Result<Cursor> {

        log::debug!("Get post at {}+{}", skip, limit);
        
        let mut pipeline: Vec<bson::Document> = Vec::new();
        pipeline.push(doc!{
            "$match": filter,
        });
        if let Some((name, order)) = sort {
            pipeline.push(doc!{
                "$sort" : {
                    name: order as i32
                }
            });
        }
        
        pipeline.push(doc!{
            "$skip": skip as i32
        });
        pipeline.push(doc!{
            "$limit": limit as i32
        });

        // Join with user info
        pipeline.push(doc!{
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
        pipeline.push(doc!{
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
                                "$arrayElemAt": ["$user_info.info", 0]
                            },
                        }
                    ]
                }
            }
        });

        // Remove private user info
        pipeline.push(doc!{
            "$unset": ["author.email"]
        });

        collection.aggregate(pipeline, None)
            .await
            .map_model_result()
    }
    
}