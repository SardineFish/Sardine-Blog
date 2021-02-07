use std::usize;

use bson::{Document, doc};
use chrono::Utc;
use mongodb::{Collection, Cursor, Database, bson::{self, oid::ObjectId}, options::{FindOneAndUpdateOptions, FindOptions}};
use tokio::stream::StreamExt;
use super::post_data::{Post, PostContent};

use crate::{PostType, error::*, model::PidType, post_data::PostStats};

use super::{post_data::FlatPostData, user::PubUserInfo};

use serde::{Serialize, Deserialize, de::DeserializeOwned};

const COLLECTION_POST: &str = "post";
const COLLECTION_META: &str = "meta";

// pub trait Post {
//     fn pid(&self) -> PidType;
//     fn stats(&self) -> &PostStats;
//     fn author(&self) -> &PubUserInfo;
//     fn time(&self) -> chrono::DateTime<Utc>;
//     fn post_type(&self) -> PostType;
// }


#[derive(Serialize, Deserialize)]
struct PostMetaData {
    pub _id: ObjectId,
    pub posts: PidType,
}

fn query(pid: PidType) -> Document {
    doc! {
        "pid": pid
    }
}


pub enum SortOrder{
    ASC = 1,
    DESC = -1,
}

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

    // pub async fn get_list<T: FlatPostData + DeserializeOwned>(&self, from: usize, count: usize) -> Result<Vec<T>> {
    //     let mut opts = FindOptions::default();
    //     opts.skip = Some(from as i64);
    //     opts.limit = Some(count as i64);

    //     let result = self.collection.find(None, opts)
    //         .await
    //         .map_model_result()?;
        
    //     let posts: Vec<T> = result.filter_map(
    //         |t| t.ok().and_then(
    //             |doc| bson::from_document(doc).ok()))
    //         .collect()
    //         .await;

    //     Ok(posts)
    // }

    // pub async fn get_by_pid<T: Post + DeserializeOwned>(&self, pid: PidType) -> Result<T> {
    //     let doc = self.collection.find_one(query(pid), None)
    //         .await
    //         .map_model_result()?
    //         .ok_or(Error::PostNotFound(pid))?;

    //     bson::from_document(doc).map_model_result()
    // }

    // pub async fn post<T: Post + Serialize>(&self, post: &T) -> Result<()> {
    //     let doc = bson::to_document(post).map_model_result()?;
    //     self.collection.insert_one(doc, None)
    //         .await
    //         .map_model_result()?;
    //     Ok(())
    // }

    // pub async fn update<T: Serialize, P: Post + DeserializeOwned>(&self, pid: PidType, data: &T) -> Result<P> {
    //     let update = doc! {
    //         "$set": bson::to_bson(data).map_model_result()?
    //     };
    //     let doc = self.collection.find_one_and_update(query(pid), update, self.update_options.clone())
    //         .await
    //         .map_model_result()?
    //         .ok_or(Error::PostNotFound(pid))?;

    //     bson::from_document(doc).map_model_result()
    // }

    // pub async fn delete<P: Post + DeserializeOwned>(&self, pid: PidType) -> Result<Option<P>> {
    //     let doc = self.collection.find_one_and_delete(query(pid), None)
    //         .await
    //         .map_model_result()?;
    //     if let Some(doc) = doc {
    //         Ok(Some(bson::from_document(doc).map_model_result()?))
    //     } else {
    //         Ok(None)
    //     }
    // }

    
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
    
    pub async fn new_pid(&self) -> Result<PidType> {
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
        Ok(metadata.posts)
    }

    pub async fn insert(&self, post: &Post) -> Result<()> {
        self.collection.insert_one(bson::to_document(&post).map_model_result()?, None)
            .await
            .map_model_result()?;
        Ok(())
    }

    pub async fn delete(&self, pid: PidType) -> Result<Option<PostType>> {
        let query = doc! {
            "pid": pid
        };
        let doc = self.collection.find_one_and_delete(query, None)
            .await
            .map_model_result()?;

        if let Some(doc) = doc {
            Ok(Some(bson::from_document(doc)
                .map_model_result()?))
        } else {
            Ok(None)
        }
    }

    pub async fn update_content<T: PostContent + Serialize + DeserializeOwned>(&self, pid: PidType, content: &T) -> Result<()> {
        let query = doc! {
            "pid": pid
        };
        let update = doc! {
            "data.content": bson::to_bson(&content).map_model_result()?
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
            .filter_map(|d| d.ok().and_then(|doc| bson::from_document::<P>(doc).ok()))
            .collect()
            .await;
        Ok(result)
    }

    pub async fn get_post_by_pid<P : FlatPostData + DeserializeOwned>(&self, pid:PidType) -> Result<P> {
        let query = doc!{
            "pid": pid
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
                        "$post",
                        {
                            "pid": "$pid",
                            "time": "$time",
                            "stats": "$stats",
                            "author": {
                                "$arrayElemAt": ["$user_info.info", 0]
                            }
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