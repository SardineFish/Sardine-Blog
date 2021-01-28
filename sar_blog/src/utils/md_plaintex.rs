use core::panic;

use pulldown_cmark::{CowStr, Event, Tag};

use super::StringBuilder;

pub fn write_plaintext<'s>(parser: pulldown_cmark::Parser<'s>, limit: usize) -> String {
    let mut builder = StringBuilder::<&str>::with_capacity(16);

    for event in parser {
        match event {
            Event::Text(text) => {
                let slice = text.unwrap_str();
                if slice.len() + builder.len() >= limit {
                    
                    builder.push(&slice[..limit - builder.len()]);
                    break;
                }
                builder.push(slice);
            }
            Event::HardBreak => {
                builder.push("\r\n");
            }
            Event::End(Tag::Item)
            | Event::End(Tag::Paragraph)
            | Event::End(Tag::BlockQuote)
            | Event::End(Tag::CodeBlock(_))
            | Event::End(Tag::Heading(_)) => {
                builder.push("\r\n");
            }
            _ => ()
        }
    }

    builder.to_string()
}

trait UnwrapCowStr<'s> {
    fn unwrap_str(self) -> &'s str;
}

impl<'s> UnwrapCowStr<'s> for CowStr<'s> {
    fn unwrap_str(self) -> &'s str {
        match self {
            CowStr::Borrowed(text) => text,
            _ => panic!()
        }
    }
}