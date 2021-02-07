# Blog

## List Blogs
`GET /api/blog`

### Query Params
```
from: number
count: number
```

### Response
```json
[
    {
        "pid": 0,
        "title": "Title",
        "author": "Name",
        "time": "UTC Time",
        "tags": ["tag1", "..."],
        "preview": "Preview content",
        "stats": {
            "likes": 0,
            "views": 0,
            "comments": 0,
        }
    }
]
```

--------

## Get Blog By Pid
`GET /blog/{pid:number}`

Each individual IP will increase views count once per day.

### Response
```json
{
    "pid": 0,
    "title": "Title",
    "author": {
        "name": "Display name",
        "avatar": "Avatar url",
        "url": "Url",
    },
    "time": "UTC Time",
    "tags": ["tag1", "..."],
    "type": "PlainText | Markdown | HTML",
    "doc": "Document Content",
    "stats": {
        "likes": 0,
        "views": 0,
        "comments": 0,
    }
}
```

### Error
- `404` Blog not exists.


--------


## Post Blog
`POST /api/blog`

`auth == Owner`

### Request
```json
{
    "title": "Title",
    "tags": ["tag1", "..."],
    "doc_type": "PlainText | Markdown | HTML",
    "doc": "Document Content"
}
```

### Response
```json
{
    "pid": 0
}
```


--------


## Update Blog
`PUT /api/blog/{pid:number}`

`auth == Owner`

### Request
```json
{
    "title": "Title",
    "tags": ["tag1", "..."],
    "doc_type": "PlainText | Markdown | HTML",
    "doc": "Document Content"
}
```

### Response
```json
{
    "pid": 0
}
```

### Error
- `404` Blog not exists.


--------


## Delete Blog
`DELET /api/blog/{pid:number}`

`auth == Owner`

### Response
If the blog exists, the full data will be returned.
```json
{
    "title": "Title",
    "tags": ["tag1", "..."],
    "doc_type": "PlainText | Markdown | HTML",
    "doc": "Document Content",
}
```

If not exists, empty data with status code `204 No Content` will response.


--------

