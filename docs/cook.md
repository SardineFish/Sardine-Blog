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
        "pid": 123,
        "time": 1656828743475,
        "author": {
            "name": "<author name>",
            "avatar": "<avatar url>",
            "url": "<author url>"
        },
        "stats": {
            "likes": 1,
            "views": 2,
            "comments": 3
        },
        "content": {
            "title": "<title>",
            "description": "<description>",
            "images": [
                "<url1>",
                "<url2>"
            ],
            "requirements": [
                "requirement1",
                "requirement2",
                "..."
            ],
            "optional": [
                "item1",
                "item2",
                "..."
            ]
        }
    }
]
```

## Get recipe details
`GET /api/cook/{pid}`

### Response
```json
{
    "pid": 123,
    "time": 1656828743475,
    "author": {
        "name": "<author name>",
        "avatar": "<avatar url>",
        "url": "<author url>"
    },
    "stats": {
        "likes": 1,
        "views": 2,
        "comments": 3
    },
    "content": {
        "title": "<title>",
        "description": "<description>",
        "images": [
            "<url1>",
            "<url2>"
        ],
        "requirements": [
            "requirement1",
            "requirement2",
            "..."
        ],
        "optional": [
            "item1",
            "item2",
            "..."
        ],
        "content": "<content of recipe in markdown format>"
    }
}
```

## Post recipe
`POST /api/cook`

`auth >= Trusted`

### Request
```json
{
    "title": "<title>",
    "description": "<description>",
    "requirements": [
        "requirement1",
        "requirement2",
        "..."
    ],
    "images": [
        "<url1>",
        "<url2>"
    ],
    "optional": [
        "item1",
        "item2",
        "..."
    ],
    "content": "<content of recipe in markdown format>"
}
```

## Update recipe
`PUT /api/cook/{pid}`

`auth >= Trusted`

### Request
```json
{
    "title": "<title>",
    "description": "<description>",
    "images": [
        "<url1>",
        "<url2>"
    ],
    "requirements": [
        "requirement1",
        "requirement2",
        "..."
    ],
    "optional": [
        "item1",
        "item2",
        "..."
    ],
    "content": "<content of recipe in markdown format>"
}
```

## Delete recipe
`DELETE /api/cook/{pid}`

`auth >= Owner`

### Response

```json
{
    "title": "<title>",
    "description": "<description>",
    "images": [
        "<url1>",
        "<url2>"
    ],
    "requirements": [
        "requirement1",
        "requirement2",
        "..."
    ],
    "optional": [
        "item1",
        "item2",
        "..."
    ],
    "content": "<content of recipe in markdown format>"
}
```

If post not exists, return `null` in `data`