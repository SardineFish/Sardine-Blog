use std::{borrow::Cow, mem};

use html2text::render::text_renderer::TrivialDecorator;
use pulldown_cmark::{CowStr, Event, Tag};

use super::string_builder::StringBuilder;

fn round_char_boundary(input: &str, len: usize) -> usize {
    let min = if len >= 4 { len - 4 } else { 0 };

    for i in (min..=len).rev() {
        if i == 0 {
            return 0;
        } else if input.is_char_boundary(i) {
            return i;
        }
    }
    0
}

pub fn slice_utf8(input: &str, len: usize) -> &str {
    if input.len() < len {
        input
    } else {
        &input[..round_char_boundary(input, len)]
    }
}

struct MarkdownToPlaintext<'s> {
    input: &'s str,
    len_limit: usize,
    text_builder: StringBuilder<Cow<'s, str>>,
    html_builder: StringBuilder<CowStr<'s>>,
    prev_event: Option<Event<'s>>,
}

impl<'s> MarkdownToPlaintext<'s> {
    fn new(input: &'s str, limit: usize) -> Self {
        Self {
            input,
            len_limit: limit,
            text_builder: StringBuilder::new(),
            html_builder: StringBuilder::new(),
            prev_event: None,
        }
    }

    fn into_plaintext(mut self) -> String {
        let parser = pulldown_cmark::Parser::new(self.input);

        for event in parser {
            match &event {
                Event::Html(html) => {
                    self.html_builder.push(html.to_owned());
                }
                non_html => {
                    self.build_html();
                    self.parse_non_html_event(non_html);
                }
            }
            self.prev_event = Some(event);

            if self.text_builder.len() >= self.len_limit {
                break;
            }
        }
        self.build_html();

        self.text_builder.to_string()
    }

    fn rest_len(&self) -> usize {
        self.len_limit - self.text_builder.len()
    }

    fn build_html(&mut self) {
        if !self.html_builder.is_empty() {
            let html = mem::replace(&mut self.html_builder, StringBuilder::new()).to_string();
            let mut text = html2text::from_read_with_decorator(
                html.as_bytes(),
                usize::MAX,
                TrivialDecorator {},
            );
            if text.len() + self.text_builder.len() > self.len_limit {
                text.truncate(round_char_boundary(&text, self.rest_len()));
                self.text_builder.push(Cow::Owned(text));
            } else {
                self.text_builder.push(Cow::Owned(text));
            }
        }
    }

    fn parse_non_html_event(&mut self, event: &Event<'s>) {
        match event {
            Event::Text(text) | Event::Code(text) => {
                self.text_builder.push(self.clip_text(text.to_owned()));
            }
            Event::SoftBreak => {
                self.text_builder.push(Cow::Borrowed(" "));
            }
            Event::HardBreak => {
                self.text_builder.push(Cow::Borrowed("\r\n"));
            }
            Event::Start(Tag::List(_)) => {
                if let Some(Event::Text(_)) = self.prev_event {
                    self.text_builder.push(Cow::Borrowed("\r\n"));
                }
            }
            Event::End(Tag::Item)
            | Event::End(Tag::Paragraph)
            | Event::End(Tag::BlockQuote)
            | Event::End(Tag::CodeBlock(_))
            | Event::End(Tag::Heading(_)) => {
                if let Some(prev) = &self.prev_event {
                    match prev {
                        Event::End(Tag::Item)
                        | Event::End(Tag::Paragraph)
                        | Event::End(Tag::BlockQuote)
                        | Event::End(Tag::List(_))
                        | Event::End(Tag::CodeBlock(_))
                        | Event::End(Tag::Heading(_)) => (),
                        _ => {
                            self.text_builder.push(Cow::Borrowed("\r\n"));
                        }
                    }
                }
            }
            _ => (),
        }
    }

    fn clip_text(&self, text: CowStr<'s>) -> Cow<'s, str> {
        if text.len() + self.text_builder.len() >= self.len_limit {
            match text {
                CowStr::Borrowed(text) => Cow::Borrowed(slice_utf8(text, self.rest_len())),
                CowStr::Boxed(text) => {
                    Cow::Owned(slice_utf8(&text[..], self.rest_len()).to_owned())
                }
                CowStr::Inlined(text) => {
                    Cow::Owned(slice_utf8(&text[..], self.rest_len()).to_owned())
                }
            }
        } else {
            match text {
                CowStr::Borrowed(text) => Cow::Borrowed(text),
                CowStr::Boxed(text) => Cow::Owned(text[..].to_owned()),
                CowStr::Inlined(text) => Cow::Owned(text[..].to_owned()),
            }
        }
    }
}

pub fn md2plain(markdown: &str, limit: usize) -> String {
    MarkdownToPlaintext::new(markdown, limit).into_plaintext()
}

pub fn html2plain(html: &str) -> String {
    html2text::from_read_with_decorator(html.as_bytes(), usize::MAX, TrivialDecorator {})
}

#[cfg(test)]
mod test {
    use std::usize;

    use super::*;
    #[test]
    fn test_md2plain() {
        let input = "\
# This is an h1 tag
## This is an h2 tag
###### This is an h6 tag

*This text will be italic*
_This will also be italic_
**This text will be bold**
__This will also be bold__
_You **can** combine them_

* Item 1
* Item 2
  * Item 2a
  * Item 2b

1. Item 1
2. Item 2
3. Item 3
   1. Item 3a
   2. Item 3b

![GitHub Logo](/images/logo.png)
[GitHub](http://github.com)

As Kanye West said:

> We're living the future so
> the present is our past.

I think you should use an
`<addr>` element here instead.

```javascript
if (isAwesome){
  return true
}
```
";
        let expected = "\
This is an h1 tag
This is an h2 tag
This is an h6 tag
This text will be italic This will also be italic This text will be bold This will also be bold You can combine them
Item 1
Item 2
Item 2a
Item 2b
Item 1
Item 2
Item 3
Item 3a
Item 3b
GitHub Logo GitHub
As Kanye West said:
We're living the future so the present is our past.
I think you should use an <addr> element here instead.
if (isAwesome){
  return true
}

";
        let plaintext = md2plain(input, usize::MAX);
        println!("{}", plaintext);

        assert_eq!(
            plaintext.replace("\r\n", "\n"),
            expected.replace("\r\n", "\n")
        );
    }

    #[test]
    fn test_html2plain() {
        let input = r#"
<p>Hello</p><i>Here's some HTML!</i>
<h2>This is an h2 tag</h2>
<h6>This is an h6 tag</h6>
<p>
    <i>This text will be italic</i>
    <b>This text will be bold</b>
    <i>You <b>can</b> combine them</i>
</p>
<div>
    This is an div block.
    </br>
    <img src="img"/>
    <a href="url">This is an link with <span>span</span></a>
</div>
"#;
        let expected = r#"Hello

Here's some HTML!

This is an h2 tag

This is an h6 tag

This text will be italic This text will be bold You can combine them

This is an div block.
This is an link with span
"#;
        let plaintext = html2plain(input);
        println!("{}", plaintext);

        assert_eq!(plaintext, expected);
    }
}
