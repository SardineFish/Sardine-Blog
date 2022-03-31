use std::{ cell::{Ref, RefCell, RefMut}, collections::{HashMap}};
use std::rc::Rc;

use chrono::{DateTime, Utc};
use model::{Comment, CommentContent, PidType, PostType, PubUserInfo};
use serde::{ Serialize, Serializer};
use crate::{email_notify::CommentNotifyInfo, user::Author, utils::json_datetime_format, post::PostServiceExtend};

use crate::{error::*};

#[derive(Serialize)]
pub struct NestedComment {
    pub pid: PidType,
    pub comment_to: PidType,
    pub author: PubUserInfo,
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

impl Serialize for NestedCommentRef {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
            S: Serializer {
        self.borrow().serialize(serializer)
    }
}

impl From<Comment> for NestedComment {
    fn from(comment: Comment) -> Self {
        Self{
            pid: comment.pid,
            comment_to: comment.comment_to,
            author: comment.author,
            time: comment.time.into(),
            text: comment.content.text,
            comments: Vec::with_capacity(2),
            depth: 0,
        }
    }
}

pub type CommentService<'s> = PostServiceExtend<'s, CommentContent>;

impl<'m> CommentService<'m> {

    pub async fn get_comments_of_pid(&self, pid: PidType, depth_limit: usize) ->Result<Vec<NestedCommentRef>> {
        let comments = self.inner().service.model.comment.get_by_comment_root(pid)
            .await?;

        CommentService::construct_comments(comments, pid, depth_limit)
    }

    pub async fn post(&self, comment_to: PidType, text: &str, author: Author) -> Result<PidType> {
        let post = self.service().model.post.get_raw_by_pid(comment_to)
            .await?;
       let user = match author {
            Author::Anonymous(info) => self.service().user().get_anonymous(&info).await?,
            Author::Authorized(auth) => 
                self.service().model.user.get_by_uid(&auth.uid).await.map_service_err()?
        };

        let comment_root = match &post.data {
            PostType::Blog(_) | PostType::Note(_) | PostType::Miscellaneous(_) => post.pid,
            PostType::Comment(content) => content.comment_root,
        };

        

        let pid = self.inner().post(&user.uid, CommentContent {
            comment_root,
            comment_to,
            text: text.to_owned(),
            notified: false,
        }).await?;

        { // Try send notification email
            let receiver = self.service().model.user.get_by_uid(&post.uid).await?;
            if let Some(email) = &receiver.info.email {
                let url = self.service().url().url_from_post(&post).await?;

                let result = self.service().push_service().send_comment_notify(email, CommentNotifyInfo {
                    author_avatar: user.info.avatar,
                    author_name: user.info.name,
                    author_url: user.info.url.unwrap_or_else(|| self.service().url().homepage()),
                    url,
                    time: Utc::now().format("%Y-%m-%d %H-%M-%S").to_string(),
                    comment_text: text.to_owned(),
                    receiver_name: receiver.info.name,
                    unsubscribe_url: self.service().url().unsubscribe_notification(&receiver.uid),
                }).await;

                if let Err(err) = result {
                    log::error!("Failed to send email notification:{:?}", err);
                } else {
                    self.service().model.comment.update_notify_state(pid, true).await?;
                }
            }
        }

        Ok(pid)
    }

    pub async fn delete(&self, uid: &str, pid: PidType) -> Result<Option<CommentContent>> {
        self.inner().delete(uid, pid).await
    }

    fn construct_comments(comments: Vec<Comment>, root_pid: PidType, depth_limit: usize) -> Result<Vec<NestedCommentRef>> {
        let mut nested_comments: HashMap<PidType, NestedCommentRef> = HashMap::with_capacity(comments.len());
        let mut comment_container: HashMap<PidType, PidType> = HashMap::with_capacity(comments.len());
        let mut root_comments = Vec::<NestedCommentRef>::with_capacity(4);
        
        for comment in comments {
            let comment_ref = NestedCommentRef::new(comment);
            nested_comments.insert(comment_ref.pid(), comment_ref.clone());

            if comment_ref.comment_to() == root_pid || depth_limit == 1 {
                comment_ref.borrow_mut().depth = 1;
                comment_container.insert(comment_ref.pid(), root_pid);
                root_comments.push(comment_ref);
            } else {
                let parent = nested_comments.get(&comment_ref.comment_to());
                if parent.is_none() {
                    continue;
                }
                let parent = parent.unwrap();

                if parent.depth() < depth_limit {
                    comment_ref.borrow_mut().depth = parent.depth() + 1;
                    comment_container.insert(comment_ref.pid(), parent.pid());
                    parent.borrow_mut().comments.push(comment_ref);
                } else {
                    comment_ref.borrow_mut().depth = parent.depth();
                    let parent_container_pid = *comment_container.get(&parent.pid())
                        .ok_or_else(|| Error::post_not_found(parent.pid()))?;
                        
                    let grandparent = nested_comments.get(&parent_container_pid)
                        .ok_or_else(|| Error::post_not_found(parent.comment_to()))?;
                    comment_container.insert(comment_ref.pid(), parent_container_pid);
                    grandparent.borrow_mut().comments.push(comment_ref);
                }
            }
        }

        Ok(root_comments)
    }
}