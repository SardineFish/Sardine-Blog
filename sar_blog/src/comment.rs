use std::{borrow::{Borrow, BorrowMut}, cell::{Ref, RefCell, RefMut}, collections::{HashMap, HashSet}, ops::Deref};
use std::rc::Rc;

use chrono::{DateTime, Utc};
use model::{AnonymousUserInfo, AuthenticationInfo, Comment, History, HistoryData, Model, PidType, PostData, PostType, RedisCache, SessionAuthInfo, SessionID};
use serde::{Deserialize, Serialize, Serializer};
use crate::{service::Service, utils::json_datetime_format};

use crate::{error::*, utils};

#[derive(Serialize)]
pub struct NestedComment {
    pub pid: PidType,
    pub comment_to: PidType,
    pub author: String,
    #[serde(with="json_datetime_format")]
    pub time: DateTime<Utc>,
    pub text: String,
    pub comments: Vec<NestedCommentRef>,
    pub(self) depth: usize,
}

#[derive(Clone)]
pub struct NestedCommentRef(pub(self) Rc<RefCell<NestedComment>>);

impl NestedCommentRef{
    pub fn new(comment: Comment) -> Self {
        Self(Rc::new(RefCell::new(comment.into())))
    }

    pub fn borrow(&self) -> Ref<NestedComment> {
        RefCell::borrow(&self.0)
    }

    pub fn borrow_mut(&self) -> RefMut<NestedComment> {
        RefCell::borrow_mut(&self.0)
    }

    pub fn pid(&self) -> PidType {
        self.borrow().pid
    }

    pub fn depth(&self)-> usize {
        self.borrow().depth
    }

    pub fn comment_to(&self) -> PidType {
        self.borrow().comment_to
    }
}

// impl Deref for NestedCommentRef {
//     type Target = NestedComment;
//     fn deref(&self) -> &Self::Target {
//         let comment: Ref<'_, NestedComment> = RefCell::borrow(&self.0);
//         comment
//     }
// }

impl Serialize for NestedCommentRef {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
            S: Serializer {
        self.serialize(serializer)
    }
}

impl From<Comment> for NestedComment {
    fn from(comment: Comment) -> Self {
        Self{
            pid: comment.pid,
            comment_to: comment.comment_to,
            author: comment.author,
            time: comment.time.into(),
            text: comment.text,
            comments: Vec::with_capacity(2),
            depth: 0,
        }
    }
}

pub struct CommentService<'m> {
    model: &'m Model,
    redis: &'m RedisCache,
    service: &'m Service,
}

impl<'m> CommentService<'m> {
    pub fn new(service: &'m Service) -> Self {
        Self{
            service: service,
            model: &service.model,
            redis: &service.redis,
        }
    }

    pub async fn get_comments_of_pid(&self, pid: PidType, depth_limit: usize) ->Result<Vec<NestedCommentRef>> {
        let comments = self.model.comment.get(pid)
            .await
            .map_service_err()?;

        CommentService::construct_comments(comments, pid, depth_limit)
    }

    pub async fn post(&self, comment_to: PidType, text: &str, session_id: &SessionID, author_info: &AnonymousUserInfo) -> Result<PidType> {
        let post_data = self.model.post_data.get_by_pid(comment_to).await.map_service_err()?;
        let pid = self.model.post_data.new_pid().await.map_service_err()?;
        let uid = self.redis.session(&session_id).uid().await.map_service_err()?;
        let user = match &uid {
            Some(uid) => self.model.user.get_by_uid(uid).await.map_service_err()?,
            None => self.service.user().get_anonymous(author_info).await?
        };

        let root_pid = match post_data.post {
            PostType::Comment(_, pid) => pid,
            _ => comment_to,
        };

        let mut comment = Comment::new(root_pid, pid, comment_to, &user);
        comment.text = text.to_string();

        self.model.comment.post(&comment).await.map_service_err()?;

        self.model.history.record(&user.uid, model::Operation::Create, HistoryData::Comment(comment))
            .await
            .map_service_err()?;

        Ok(pid)
    }

    pub async fn delete(&self, uid: &str, pid: PidType) -> Result<Option<Comment>> {
        let post_data = self.model.post_data.get_by_pid(pid).await.map_service_err()?;
        if let PostType::Comment(_, root_pid) = post_data.post {
            let comment = self.model.comment.delete(root_pid, pid).await.map_service_err()?;

            Ok(comment)
        } else {
            Ok(None)
        }
    }

    fn construct_comments(comments: Vec<Comment>, root_pid: PidType, depth_limit: usize) -> Result<Vec<NestedCommentRef>> {
        let mut nested_comments: HashMap<PidType, NestedCommentRef> = HashMap::with_capacity(comments.len());
        let mut root_comments = Vec::<NestedCommentRef>::with_capacity(4);
        
        for comment in comments {
            let comment_ref = NestedCommentRef::new(comment);
            nested_comments.insert(comment_ref.pid(), comment_ref.clone());

            if comment_ref.pid() == root_pid || depth_limit == 1 {
                comment_ref.borrow_mut().depth = 1;
                root_comments.push(comment_ref);
            } else {
                let parent = nested_comments.get(&comment_ref.comment_to())
                    .ok_or(Error::post_not_found(comment_ref.borrow().comment_to))?;

                if parent.depth() < depth_limit {
                    comment_ref.borrow_mut().depth = parent.depth() + 1;
                    parent.borrow_mut().comments.push(comment_ref);
                } else {
                    comment_ref.borrow_mut().depth = parent.depth();
                    let grandparent = nested_comments.get(&parent.comment_to())
                        .ok_or(Error::post_not_found(parent.comment_to()))?;
                    grandparent.borrow_mut().comments.push(comment_ref);
                }
            }
        }

        Ok(root_comments)
    }
}