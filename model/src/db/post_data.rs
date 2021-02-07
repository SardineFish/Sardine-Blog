use chrono::Utc;
use mongodb::{Collection, Database, bson::{DateTime, doc, oid::ObjectId}};
use serde::{Deserialize, Serialize};

use crate::{Blog, BlogContent, Comment, Note, User, misc::usize_format};
use crate::{ model::PidType};

use super::{comment::CommentContent, note::NoteContent};

const COLLECTION_POST_DATA: &str = "post";


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
    pub fn new(pid: PidType, post: PostType, author: &User) -> Self{
        Self {
            _id: ObjectId::new(),
            pid,
            uid: author.uid.to_string(),
            time: Utc::now().into(),
            stats: Default::default(),
            data: post,
        }
    }
}

// impl<T> From<&T> for PostType where T : Post {
//     fn from(post: &T) -> Self {
//         Self {
//             _id: ObjectId::new(),
//             pid: post.pid(),
//             author: post.author().to_string(),
//             time: post.time().into(),
//             post: post.post_type(),
//         }
//     }
// }


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
