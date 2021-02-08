use std::{ops::Deref};

use email_address_parser::EmailAddress;
use lazy_static::lazy_static;
use model::{Access, NoteContent, UserInfo};
use regex::Regex;
use crate::error::*;

pub trait Validate {
    fn validate(&self) -> Result<()> {
        Err(Error::InternalServiceError("Validator not implement"))
    }
    #[allow(unused_variables)]
    fn validate_with_access(&self, access: Access) -> Result<()> {
        Err(Error::InternalServiceError("Validator not implement"))
    }
}

lazy_static!{
}

pub fn validate_uid(uid: &str) -> Result<()> {
    let reg = Regex::new(r"^[_A-Za-z0-9]{6,32}$").unwrap();
    if !reg.is_match(uid) {
        Ok(())
    } else {
        Err(Error::InvalidParams("'uid' dose not match /^[_A-Za-z0-9]{6,32}$/".to_owned()))
    }
}

pub fn validate_email(email: &str) -> Result<()> {
    if EmailAddress::is_valid(email, None) {
        Ok(())
    } else {
        Err(Error::InvalidParams("Invalid email address".to_owned()))
    }
}

pub fn validate_url(url: &str, name: &str) -> Result<()> {
    if url::Url::parse(url).is_ok() {
        Ok(())
    } else {
        Err(Error::InvalidParams(format!("Invalid URL of '{}'", name)))
    }
}

pub fn validate_name(str: &str) -> Result<()> {
    let reg = Regex::new(r"^([^\s][^\t\r\n\f]{0,30}[^\s])|([^\s])$").unwrap();
    if reg.is_match(str) {
        Ok(())
    } else {
        Err(Error::InvalidParams(r"Invalid name, not match with /^([^\s][^\t\r\n\f]{0,30}[^\s])|([^\s])$/".to_owned()))
    }
}


type ValidatorFn<T> = fn(&T) -> Result<()>;

trait ValidateOption<T> {
    fn validate_allow_none(&self, validator: ValidatorFn<T>) -> Result<()>;
    fn validate_not_none(&self, validator: ValidatorFn<T>) -> Result<()>;
}

impl<T> ValidateOption<T> for Option<T> {
    fn validate_allow_none(&self, validator: ValidatorFn<T>) -> Result<()> {
        if let Some(val) = self {
            validator(val.deref())
        } else {
            Ok(())
        }
    }
    fn validate_not_none(&self, validator: ValidatorFn<T>) -> Result<()> {
        if let Some(val) = self {
            validator(val.deref())
        } else {
            Err(Error::InvalidParams("Missing parm".to_owned()))
        }
    }
}

impl Validate for UserInfo {
    fn validate(&self) -> Result<()> {
        validate_name(&self.name)?;
        validate_url(&self.avatar, "avatar")?;
        self.email.validate_allow_none(|email| validate_email(email))?;
        self.url.validate_allow_none(|url| validate_url(url, "url"))?;

        Ok(())
    }
}

impl Validate for NoteContent {
    fn validate_with_access(&self, access: Access) -> Result<()> {
        match self.doc_type {
            model::DocType::HTML | model::DocType::Markdown => {
                if access < Access::Trusted {
                    Err(Error::InvalidParams("Invalid doc_type".to_owned()))
                } else {
                    Ok(())
                }
            }
            model::DocType::PlainText => Ok(())
        }
    }
}