
use mongodb::{Collection, Database, bson::{self, doc}};
use serde::{Serialize, Deserialize};
use tokio::stream::StreamExt;

use crate::{model::PidType, PostData, PostType};
use crate::error::*;

use super::{post::{PostModel, SortOrder, Post}};

const COLLECTION_COMMENT: &str = "post";

pub type Comment = Post<CommentContent>;

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
    pub notified: bool,
}

impl PostData for CommentContent {
    fn post_type_name() -> &'static str {
        "Comment"
    }

    fn wrap(self) -> crate::PostType {
        PostType::Comment(self)
    }

    fn unwrap(data: crate::PostType) -> Option<Self> {
        match data {
            PostType::Comment(data) => Some(data),
            _ => None,
        }
    }
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
        let result: Vec<Comment> = PostModel::get_flat_posts(&self.collection, query, 0, 128, Some(("pid", SortOrder::ASC)))
            .await?
            .filter_map(|d|d.ok().and_then(|doc| {
                let result = bson::from_document::<Comment>(doc);
                if let Err(err) = &result {
                    log::warn!("Error when deserializing a Comment: {}", err);
                }
                result.ok()
            }))
            .collect()
            .await;
        
        Ok(result)
            
    }

    pub async fn update_notify_state(&self, pid: PidType, notified: bool) -> Result<()> {
        let query = doc! {
            "pid": pid,
            "data.type": "Comment",
        };
        let update = doc! {
            "$set": {
                "data.content.notified": notified,
            }
        };
        let result = self.collection.update_one(query, update, None).await?;
        if result.matched_count <= 0 {
            Err(Error::PostNotFound(pid))
        } else {
            Ok(())
        }
    }
}