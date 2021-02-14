# User Access

## User Access Levels
We use access level to control the operation permissions, access levels are sequence of numbers including:
- `Root` = 32
- `Owner` = 16,
- `Trusted` = 8,
- `Registered` = 4,
- `Anonymous` = 2,
- `Visitor` = 1,
- `Forbidden` = 0,

Users with higher value of access level have higher permission.


--------


## Get Authentication Challenge
`GET /api/user/{uid:string}/challenge`

### Response
```json
{
    "salt": "Salt string",
    "method": "Hash method <SHA256 | ...>",
    "challenge": "Random challenge string",
}
```

--------

## Login
`POST /api/user/login`

### Request
```json
{
    "uid": "Uid or Email",
    "pwd_hash": "Password Hash calculated by hash(hash(password + salt) + challenge)"
}
```

### Response
```json
{
    "session_id": "Session ID",
    "token": "Token",
    "expire": "Expire Time",
}
```
Will also set `session` and `token` in cookie if 

### Error
- 403 User not exists or password incorrect.


--------

## Sign Up
`POST /api/user/signup`

After successfully sign up, the user will have default access level of `Registered`.

### Request
```json
{
    "uid": "[_A-Za-z0-9]{6,32}",
    "pwd_hash": "Hashed password, e.g. sha256(passwd + salt)",
    "salt": "24bit Random value in b64",
    "method": "<SHA256>",
    "name": "UTF-8 Text within 32 chars",
    "email": "(optional) user@example.com",
    "url": "(optional) Your website url",
    "avatar": "avatar url",
}
```

### Response
```json
{
    "session_id": "Session ID",
    "token": "Token",
    "expire": "Expire Time",
}
```

### Error
- `409` Conflict with exists email or uid.

--------

## Sign Out 
`auth <any>`

`DELETE /api/user/session`

`DELETE /api/user/session/{session_id:string}`

No additional request and response data if succed.


--------

## Grant Access
`PUT /api/user/{uid}/access`

`access >= Owner`

### Request
```json
{
    "access": "Access Level"
}
```

### Response
```json
{
    "uid": "Uid",
    "name": "Name",
    "access": "Access Level",
}
```

### Error
- `403` Operation not permitted.


--------


## Get user avatar
`GET /api/user/{uid:string}/avatar`

### Response
Response data is the url of the user avatar and redirect to avatar url with status code `303`.
