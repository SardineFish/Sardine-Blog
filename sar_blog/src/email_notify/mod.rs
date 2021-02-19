mod comment;
mod note;
mod error_report;

use error_report::format_error_report_email;
use note::{format_note_email};
use serde::{ Serialize, Deserialize };
use actix_web::{client};
use comment::{ format_comment_email};
use options::ServiceOptions;

use crate::error::*;
use crate::Service;

pub use comment::CommentNotifyInfo;
pub use note::NoteNotifyInfo;
pub use error_report::ErrorRecord;

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

    async fn send(&self, notify: EmailNotify<'_>) ->Result<()> {
        let mut response = client::Client::default()
            .post(format!("{}/notify/queue", &self.options.sar_push_url))
            .content_type("application/json")
            .basic_auth(&self.options.sar_push_uid, Some(&self.options.sar_push_secret))
            .send_json(&notify)
            .await
            .map_err(|_| Error::InternalServiceError("Failed to send email notify: {}"))?;
        
        match response.status() {
            status if status.is_success() => Ok(()),
            _ => {
                let msg: SarPushErrorResponse = response.json()
                    .await
                    .map_err(|_| Error::InternalServiceError("Faied to parse error response from Sar Push Service"))?;
                Err(Error::ExternalServiceError(msg.error))
            }
        }
    }
}
