# Score Ranking

## List Ranked Scores
`GET /api/rank/{key}`

### Query Params
```
skip: number
count: number
```

### Response
```json
[
    {
        "name": "Player Name",
        "time": 0,
        "score": 0
    },
]
```

### Error
- `404` Ranking not supported for `key`.


## Upload Score
`POST /api/rank/{key}`

### Request
```json
{
    "name": "Player Name",
    "score": 0,
    "data": "(option) Additional data for validation"
}
```

### Error
- `404` Ranking not supported for `key`.
- `400` Invalid score.