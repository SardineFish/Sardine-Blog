# SardineFish's Blog Documentation

## Content
- [User Access](./user.md)
- [Message Board](./note.md)
- [Blog](./blog.md)
- [Comment](./comment.md)
- [Post Data](./post-data.md)
- [Object Storage Service](./storage.md)


## Authorization

Most of API are free for request, but some required authorization with specific access level for security.

API requires authorization will be marked with `auth <level>`.

### By Cookie
For mostly usage, the authorization is based on the `session` and `token` in cookie set by login request.

### By HTTP Authentication
We also support HTTP basic authentication with the `session` as username, the `token` as the password.


## Data Scheme

All rquests data under URL base `/api` are sent and responsed in JSON.

JSON data should be sent with method `POST`, `PUT`, `UPDATE` and `PATCH` and header `Content-Type` set to `application/json`.

Successful requests will be responsed in scheme below with status code `200 OK`, the `data` field contains the actual response data.

**The response scheme in this API doc will only shows the value in `data` field.**

```json
{
    "status": "^_^",
    "timestamp": 0,
    "data": {}
}
```

Requests with error will be responsed in scheme below with status code `4XX` or `5XX`, the `code` represents the internal error code.

```json
{
    "status": ">_<",
    "timestamp": 0,
    "code": 0,
    "msg": "Error message"
}
```