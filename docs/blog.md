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
        "time": "Sun, 07 Feb 2021 15:04:33 +0000",
        "tags": ["tag1", "..."],
        "author": {
            "name": "Name of author",
            "avatar": "http://example.com/avatar.png",
            "url": "http://user.example.com/ or null"
        },
        "preview": "Preview content of blog"
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
        "name": "Name of Test",
        "avatar": "http://example.com/avatar.png",
        "url": "http://user.example.com/ or null"
    },
    "time": "Sun, 07 Feb 2021 15:04:33 +0000",
    "tags": ["tag1", "..."],
    "doc_type": "PlainText",
    "doc": "Content of the blog",
    "stats": {
        "likes": 0,
        "views": 0,
        "comments": 0
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
Responsed data is just the `pid` of the blog.


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
Responsed data is just the `pid` of the blog.

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

