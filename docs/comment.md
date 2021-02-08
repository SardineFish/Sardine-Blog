# Universal Comment System

## Get Comment of Pid
`Get /api/comment/{pid:number}`

### Query Params
```
depth: number
```

### Response
The max nesting depth is specific by `depth` in query params. 
Comments which depth > `depth` will be flatten into the parent comment.
```json
[
    {
        "pid": 0,
        "comment_to": 0,
        "author": {
            "name": "Name of author",
            "avatar": "http://example.com/avatar.png",
            "url": "http://user.example.com/ or null"
        },
        "time": "Sun, 07 Feb 2021 15:42:15 +0000",
        "text": "Content Text",
        "comments": ["..."],
        "depth": 1
    }
]
```


--------


## Post Comment
`POST /api/comment/{pid:number}`

### Request
```json
{
    "name": "(*) Display Name", 
    "avatar": "(*) Avatar url, normally use Gravatar by user email.",
    "email": "(optional) used for notification & Gravatar",
    "url": "(optional) Your website url",
    "text": "Content Text"
}
```
*(\*) For anonymous user, the `name` and `avatar` is required. For user signed in, only the content is required.*

### Response
Responsed data is just the `pid` of the blog.

### Error
- `404` The post of `pid` to comment not exists.


--------


## Delete Comment
`DELETE /api/comment/{pid:number}`

`auth == Owner`

### Response
```json
{
    "comment_to": 0,
    "comment_root": 0,
    "text": "Content Text"
}
```
If the comment of `pid` not exists, `204 No Content` with no additional data will responsed.

