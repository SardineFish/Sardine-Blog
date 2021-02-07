
use mongodb::{Collection, Database, bson::{self, doc}};
use serde::{Serialize, Deserialize};
use tokio::stream::StreamExt;

use crate::{PostStats, model::PidType};
use crate::error::*;

use super::{post::PostModel, user::PubUserInfo};

const COLLECTION_COMMENT: &str = "post";

#[derive(Deserialize, Clone)]
pub struct Comment {
    pub comment_to: PidType,
    pub comment_root: PidType,
    pub text: String,

    pub pid: PidType,
    pub uid: String,
    pub time: bson::DateTime,
    pub stats: PostStats,
    pub author: PubUserInfo,
}

// impl Comment {
//     pub fn new(root_pid: PidType, pid: PidType, comment_to: PidType, author: &User) -> Self {
//         Self {
//             root_pid,
//             pid,
//             comment_to,
//             author: PubUserInfo::from(author),
//             uid: author.uid.clone(),
//             time: Utc::now().into(),
//             notify: false,
//             _id: Default::default(),
//             text: Default::default(),
//         }
//     }
// }

#[derive(Serialize, Deserialize, Clone)]
pub struct CommentContent {
    pub comment_to: PidType,
    pub comment_root: PidType,
    pub text: String,
}

// impl Post for Comment {
//     fn pid(&self) -> PidType {
//         self.pid
//     }
//     fn author(&self) -> &PubUserInfo {
//         &self.author
//     }
//     fn time(&self) -> chrono::DateTime<Utc> {
//         self.time.into()
//     }
//     fn post_type(&self) -> PostType {
//         PostType::Comment
//     }
//     fn stats(&self) -> &PostStats {
//         unreachable!()
//     }
// }

// #[derive(Serialize, Deserialize)]
// struct CommentCollection {
//     pub _id: ObjectId,
//     pub pid: PidType,
//     pub comments: Vec<Comment>,
// }

// impl CommentCollection {
//     pub fn new(pid: PidType) -> Self {
//         Self {
//             _id: ObjectId::new(),
//             pid,
//             comments: Default::default(),
//         }
//     }
// }

#[derive(Clone)]
pub struct CommentModel {
    collection: Collection,
}

impl CommentModel {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection(COLLECTION_COMMENT)
        }
    }

    pub async fn get_by_comment_root(&self, pid: PidType) -> Result<Vec<Comment>> {
        let query = doc! {
            "data.type": "Comment",
            "data.content.comment_root": pid,
        };
        let result: Vec<Comment> = PostModel::get_flat_posts(&self.collection, query, 0, 64, None)
            .await?
            .filter_map(|d|d.ok().and_then(|doc| bson::from_document::<Comment>(doc).ok()))
            .collect()
            .await;
        
        Ok(result)
            
    }

    // pub async fn init_comment(&self, pid: PidType) -> Result<()> {
    //     let collection = CommentCollection::new(pid);

    //     self.collection.insert_one(bson::to_document(&collection).unwrap(), None)
    //         .await
    //         .map_model_result()?;

    //     Ok(())
    // }

    // pub async fn post(&self, comment: &Comment) -> Result<()> {
    //     let query = doc!{
    //         "pid": comment.root_pid,
    //     };
    //     let update = doc!{
    //         "$push": {
    //             "comments" : bson::to_bson(comment).unwrap()
    //         }
    //     };
    //     self.collection.update_one(query, update, None)
    //         .await
    //         .map_model_result()?;

    //     Ok(())
    // }

    // pub async fn delete(&self, root_pid: PidType, pid: PidType) -> Result<Option<Comment>> {
    //     let query = doc!{
    //         "pid": root_pid,
    //     };
    //     let update = doc! {
    //         "$pull": {
    //             "comments": {
    //                 "pid": pid
    //             }
    //         }
    //     };
    //     let mut options = FindOneAndUpdateOptions::default();
    //     options.return_document = Some(mongodb::options::ReturnDocument::Before);
    //     let result = self.collection.find_one_and_update(query, update, options)
    //         .await
    //         .map_model_result()?
    //         .ok_or(Error::PostNotFound(root_pid))?;
        
    //     let comment_collection: CommentCollection = bson::from_document(result).map_model_result()?;
    //     Ok(comment_collection.comments.into_iter().find(|c|c.pid == pid))
    // }
}