# Universal Comment System

## Get Comment of Pid
`Get /api/comment/{pid:number}`

### Response
```json
[
    {
        "pid": 0,
        "comment_to": 0,
        "author": "Uid",
        "time": "UTC Time",
        "text": "Content Text",
        "replies": [
            {
                "pid": 0,
                "comment_to": 0,
                "author": "Uid",
                "time": "UTC Time",
                "text": "Content Text"
            }
        ]
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
    "email": "(optional) used for notification & Gravatar",
    "url": "(optional) Your website url",
    "text": "Content Text",
}
```
*(\*) For anonymous user, the name is required. For user signed in, only the content is required.*

### Response
```json
{
    "pid": 0
}
```

### Error
- `404` The post of `pid` to comment not exists.


--------


## Delete Comment
`DELETE /api/comment/{pid:number}`

`auth == Owner`

### Response
```json
{
    "pid": 0,
    "comment_to": 0,
    "author": "Uid",
    "time": "UTC Time",
    "text": "Content Text",
}
```
If the comment of `pid` not exists, `204 No Content` with no additional data will responsed.
