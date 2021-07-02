# Miscellaneous API

## Get post stats
`GET /api/post/{pid:number}/stats`

### Response
```json
{
    "views": 0,
    "likes": 0,
    "comments": 0,
}
```

### Error
`404` if post of `pid` not found.


--------


## Like a post
`POST /api/post/{pid:number}/like`

If current session has already liked this post, the `likes` value of this post will not increase.

### Response
Current `likes` of this post.

### Error
`404` if post not exists.


--------


## Dislike a post
`DELETE /api/post/{pid:number}/like`

The `likes` value of this post will decrease only if current session has already liked it.

### Response
Current `likes` of this post.

### Error
`404` if post not exists.


-------


## Add a miscellaneous post
`POST /api/post/misc_post`

`Auth >= Trusted`

### Request
```json
{
    "description": "Description of this post",
    "url": "Url of this post"
}
```

### Response
Responsed data is just the `pid` of the miscellanous post.


--------

## Get Recent Post Activities
`GET /api/post/recently`

### Query String
```
skip: number
count: number
```

### Response
```json
{
    "action": "PostBlog",
    "title": "Title of the Blog",
    "name": "User Name",
    "time": 0,
    "url": "http://sardinefish.com/path/to/post"
}
```