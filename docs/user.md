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

## Login
`POST /api/user/login`

### Request
```json
{
    "user": "Uid or Email",
    "secret": "Password Hash"
}
```

### Response
```json
{
    "session": "Session ID",
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
    "uid": "[_A-Za-z][_A-Za-z0-9]{5,31}",
    "email": "user@example.com",
    "password": "Hashed password, e.g. sha256(passwd + salt)",
    "salt": "24bit Random value in b64",
    "method": "sha256",
    "name": "UTF-8 Text within 32 chars",
    "url": "Your website url (optional)",
}
```

### Response
```json
{
    "session": "Session ID",
    "token": "Token",
    "expire": "Expire Time",
}
```

### Error
- `409` Conflict with exists email or uid.

--------

## Sign Out 
`auth <any>`

`POST /api/user/signout`

`DELETE /api/user/signout/{session}`

No additional request and response data if succed.


--------

## Grant Access
`PUT /api/user/{uid}/access`

`access >= Owner`

### Request
```json
{
    "access": "Access Level",
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