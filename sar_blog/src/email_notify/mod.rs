mod comment;
mod note;
mod error_report;
mod message;

use error_report::format_error_report_email;
use message::{format_message_mail};
use note::{format_note_email};
use serde::{ Serialize, Deserialize };
use comment::{ format_comment_email};
use shared::ServiceOptions;

use crate::error::*;
use crate::Service;

pub use comment::CommentNotifyInfo;
pub use note::NoteNotifyInfo;
pub use error_report::ErrorRecord;
pub use message::MessageMail;

#[derive(Serialize)]
struct EmailNotify<'s> {
    to: &'s str,
    subject: &'s str,
    content_type: &'s str,
    body: &'s str,
}

#[derive(Deserialize)]
struct SarPushErrorResponse {
    error: String,
}

pub struct EmailNotifyService<'s> {
    options: &'s ServiceOptions,
}

impl<'s> EmailNotifyService<'s> {
    pub fn new(service: &'s Service) -> Self {
        Self {
            options: &service.option,
        }
    }

    pub async fn send_comment_notify(&self, to: &str, info: CommentNotifyInfo) -> Result<()> {
        let body = format_comment_email(&info);
        self.send(EmailNotify {
            to,
            subject: &format!("[Reply] A New Reply from {}", &info.author_name),
            content_type: "text/html",
            body: &body,
        }).await
    }

    pub async fn send_note_notify(&self, to: &str, info: NoteNotifyInfo) -> Result<()> {
        let body = format_note_email(&info);
        self.send(EmailNotify {
            to,
            subject: &format!("[Message] A New Message from {}", &info.author_name),
            content_type: "text/html",
            body: &body,
        }).await
    }

    pub async fn send_error_report(&self, to: &str, records: Vec<ErrorRecord>) -> Result<()> {
        let count = records.len();
        let body = format_error_report_email(records);
        self.send(EmailNotify {
            to,
            subject: &format!("[Error] {} Error(s) Since Last Report", count),
            content_type: "text/html",
            body: &body,
        }).await
    }

    pub async fn send_message(&self, to: &str, message: MessageMail) -> Result<()> {
        let body = format_message_mail(&message);
        self.send(EmailNotify {
            to,
            subject: &message.title,
            content_type: "text/html",
            body: &body
        }).await
    }

    async fn send(&self, notify: EmailNotify<'_>) ->Result<()> {
        let response = reqwest::Client::builder().build()
            .map_err(|err| 
                Error::InternalServiceErrorOwned(format!("Failed to send email notify: {:?}", err)))?
            .post(&format!("{}/notify/queue", &self.options.sar_push_url))
            .json(&notify)
            .basic_auth(&self.options.sar_push_uid, Some(&self.options.sar_push_secret))
            .send()
            .await
            .map_err(|err| 
                Error::InternalServiceErrorOwned(format!("Failed to send email notify: {:?}", err)))?;
        
        match response.status() {
            status if status.is_success() => Ok(()),
            _ => {
                let msg: SarPushErrorResponse = response.json()
                    .await
                    .map_err(|err| 
                        Error::InternalServiceErrorOwned(format!("Faied to parse error response from Sar Push Service: {:?}", err)))?;
                Err(Error::ExternalServiceError(msg.error))
            }
        }
    }
}
