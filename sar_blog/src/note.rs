use model::{Note, NoteContent, PidType};

use crate::post::PostServiceExtend;
use crate::{email_notify::NoteNotifyInfo, error::*, user::Author, validate::Validate};

pub type NoteService<'s> = PostServiceExtend<'s, NoteContent>;

impl<'m> NoteService<'m> {
    pub async fn get_list(&self, skip: usize, limit: usize) -> Result<Vec<Note>> {
        self.inner().get_preview_list(skip, limit).await
    }

    pub async fn post(&self, author: Author, content: NoteContent) -> Result<PidType> {
        let user = match author {
            Author::Anonymous(info) => self.service().user().get_anonymous(&info).await?,
            Author::Authorized(auth) => self.service().model.user.get_by_uid(&auth.uid).await?,
        };

        content.validate_with_access(user.access)?;
        let content_text = content.doc.clone();

        let pid = self.inner().post(&user.uid, content).await?;

        let result = self
            .service()
            .push_service()
            .send_note_notify(
                &self.service().option.message_board_notify,
                NoteNotifyInfo {
                    author_name: user.info.name,
                    author_avatar: user.info.avatar,
                    author_url: user.info.url.unwrap_or_default(),
                    url: self.service().url().note(pid),
                    time: chrono::Utc::now().format("%Y-%m-%d %H-%M-%S").to_string(),
                    content_text,
                },
            )
            .await;
        if let Err(err) = result {
            log::error!("Failed to notify a new note: {:?}", err);
        }

        Ok(pid)
    }
}
