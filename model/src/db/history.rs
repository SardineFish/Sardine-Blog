use chrono::{DateTime, Utc};
use futures_util::future::ready;
use futures_util::StreamExt;
use mongodb::bson::doc;
use mongodb::{bson, Collection, Database};
use serde::{Deserialize, Serialize};

use crate::{error::*, PidType, Post, PostData, PostDoc};
use crate::{user::User, PostType};
use shared::error::LogError;

const COLLECTION_HISTORY: &str = "history";

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum HistoryData {
    Post {
        pid: PidType,
        #[serde(flatten)]
        data: PostType,
    },
    User(User),
}

impl<T: PostData> From<Post<T>> for HistoryData {
    fn from(post: Post<T>) -> Self {
        Self::Post {
            pid: post.pid,
            data: post.content.wrap(),
        }
    }
}

impl From<PostDoc> for HistoryData {
    fn from(post: PostDoc) -> Self {
        Self::Post {
            pid: post.pid,
            data: post.data,
        }
    }
}

impl From<(PidType, PostType)> for HistoryData {
    fn from((pid, data): (PidType, PostType)) -> Self {
        Self::Post { pid, data }
    }
}

impl From<User> for HistoryData {
    fn from(user: User) -> Self {
        Self::User(user)
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Operation {
    Create,
    Update,
    Delete,
    Snapshot,
}

#[derive(Serialize, Deserialize)]
pub struct History {
    pub op: Operation,
    pub time: bson::DateTime,
    pub user: String,
    #[serde(flatten)]
    pub data: HistoryData,
}

#[derive(Serialize, Deserialize)]
pub struct PostActivity {
    pub time: bson::DateTime,
    pub op: Operation,
    pub uid: String,
    pub user_name: String,
    pub pid: PidType,
    pub data: PostType,
}

impl History {
    fn new(user: String, op: Operation, data: HistoryData) -> Self {
        Self {
            op,
            user,
            data,
            time: Utc::now().into(),
        }
    }
}

#[derive(Clone)]
pub struct HistoryModel {
    collection: Collection<History>,
}

impl HistoryModel {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection(COLLECTION_HISTORY),
        }
    }

    pub async fn init_collection(db: &Database) {
        db.run_command(
            doc! {
                "createIndexes": COLLECTION_HISTORY,
                "indexes": [
                    {
                        "key": {
                            "type": 1,
                            "op": 1,
                        },
                        "name": "type_op",
                    },
                ],
            },
            None,
        )
        .await
        .log_warn_consume("init-db-history");
        db.run_command(
            doc! {
                "createIndexes": COLLECTION_HISTORY,
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
        .log_warn_consume("init-db-history");
        db.run_command(
            doc! {
                "createIndexes": COLLECTION_HISTORY,
                "indexes": [
                    {
                        "key": {
                            "data.pid": 1,
                            "time": -1,
                        },
                        "name": "pid_time",
                    },
                ],
            },
            None,
        )
        .await
        .log_warn_consume("init-db-history");
    }

    pub async fn record<T: Into<HistoryData>>(
        &self,
        uid: &str,
        op: Operation,
        data: T,
    ) -> Result<()> {
        let history = History::new(uid.to_string(), op, Into::<HistoryData>::into(data));
        self.collection
            .insert_one(&history, None)
            .await
            .map_model_result()?;
        Ok(())
    }

    pub async fn record_with_time<T: Into<HistoryData>>(
        &self,
        uid: &str,
        op: Operation,
        data: T,
        time: DateTime<Utc>,
    ) -> Result<()> {
        let mut history = History::new(uid.to_string(), op, Into::<HistoryData>::into(data));
        history.time = time.into();
        self.collection
            .insert_one(&history, None)
            .await
            .map_model_result()?;
        Ok(())
    }

    pub async fn get_post_activities(
        &self,
        skip: usize,
        count: usize,
    ) -> Result<Vec<PostActivity>> {
        let pipe = vec![
            doc! {
                "$sort": { "time": -1 }
            },
            doc! {
                "$match": {
                    "type": "Post",
                    "op": { "$in": ["Create", "Update"] },
                    "data.type": { "$in": ["Blog", "Note", "Comment"] },
                }
            },
            doc! {
                "$skip": skip as i64,
            },
            doc! {
                "$limit": count as i64,
            },
            doc! {
                "$lookup": {
                    "from": "user",
                    "localField": "user",
                    "foreignField": "uid",
                    "as": "user",
                }
            },
            doc! {
                "$project": {
                    "op": 1,
                    "time": 1,
                    "data": 1,
                    "user": {
                        "$arrayElemAt": ["$user", 0]
                    },
                }
            },
            doc! {
                "$project": {
                    "op": 1,
                    "time": 1,
                    "uid": "$user.uid",
                    "user_name": "$user.info.name",
                    "pid": "$data.pid",
                    "data": "$data",
                }
            },
        ];

        let result = self
            .collection
            .aggregate(pipe, None)
            .await?
            .filter_map(|result| {
                ready(
                    result
                        .ok()
                        .and_then(|doc| bson::from_document::<PostActivity>(doc).ok()),
                )
            })
            .collect::<Vec<_>>()
            .await;

        Ok(result)
    }
}
