# Message Board

## List Messages
`GET /api/note`

### Query String
```
from: number
count: number
```

### Response
```json
[
    {
        "pid": 0,
        "author": "Name",
        "time": "UTC Time",
        "doc_type": "PlainText | Markdown | HTML",
        "doc": "Content",
        "stats": {
            "likes": 0,
            "views": 0,
            "comments": 0,
        }
    }
]
```

--------

## Post Message
`POST /api/note`

### Request

For authorized user, simply send the content. `Markdown` and `HTML` are only available for user authorized with access `Trusted`
```json
{
    "doc_type": "PlainText | Markdown | HTML",
    "doc": "Content",
}
```

For anonymous user, send user infos additionally:
```json
{
    "name": "UTF-8 text within 32 chars",
    "email": "(optional) Used for notification and Gravatar",
    "url": "(optional) Url of your website",
    "avatar": "User avatar, normally use Gravatar by user email.",
    "doc_type": "PlainText",
    "doc": "Content",
}
```

### Response
```json
{
    "pid": 0
}
```

--------

