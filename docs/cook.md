# Cookbook

## Get a list of recipes
`GET /api/cook/`

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