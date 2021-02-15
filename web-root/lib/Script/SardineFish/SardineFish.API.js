/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./SardineFish.API.ts":
/*!****************************!*\
  !*** ./SardineFish.API.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocType = exports.HashMethod = void 0;
function validateByPass(_, value) {
    return value;
}
function simpleParam(info) {
    const params = {};
    for (const key in info) {
        const value = info[key];
        switch (info[key]) {
            case "number":
                params[key] = {
                    type: "number",
                    validator: validateByPass,
                };
                break;
            case "string":
                params[key] = {
                    type: "string",
                    validator: validateByPass,
                };
                break;
            case "boolean":
                params[key] = {
                    type: "boolean",
                    validator: validateByPass,
                };
                break;
            case "string[]":
                params[key] = {
                    type: "string[]",
                    validator: validateByPass,
                };
                break;
            default:
                params[key] = value;
        }
    }
    return params;
}
function validateEmail(key, email) {
    if (/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email))
        return email;
    throw new APIError(ClientErrorCode.InvalidParameter, `Invalid email address in '${key}'`);
}
function validateUid(key, uid) {
    if (/[_A-Za-z0-9]{6,32}/.test(uid))
        return uid;
    throw new APIError(ClientErrorCode.InvalidParameter, `Invalid username in field '${key}'`);
}
function validateName(key, name) {
    if (/^([^\s][^\t\r\n\f]{0,30}[^\s])|([^\s])$/.test(name))
        return name;
    throw new APIError(ClientErrorCode.InvalidParameter, `Invalid name in '${key}'`);
}
function validateUrl(key, url) {
    return url;
}
function validateNonEmpty(key, text) {
    if (/^\s*$/.test(text))
        throw new APIError(ClientErrorCode.InvalidParameter, `'${key}' cannot be empty`);
    return text;
}
var ClientErrorCode;
(function (ClientErrorCode) {
    ClientErrorCode[ClientErrorCode["Error"] = -1] = "Error";
    ClientErrorCode[ClientErrorCode["InvalidParameter"] = -2] = "InvalidParameter";
    ClientErrorCode[ClientErrorCode["NetworkFailure"] = -3] = "NetworkFailure";
    ClientErrorCode[ClientErrorCode["ParseError"] = -4] = "ParseError";
})(ClientErrorCode || (ClientErrorCode = {}));
class APIError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
class ApiBuilder {
    constructor(method, url, path, query, data) {
        this.method = method;
        this.url = url;
        this.pathInfo = path;
        this.queryInfo = query;
        this.dataInfo = data;
    }
    path(path) {
        return new ApiBuilder(this.method, this.url, simpleParam(path), this.queryInfo, this.dataInfo);
    }
    query(query) {
        return new ApiBuilder(this.method, this.url, this.pathInfo, simpleParam(query), this.dataInfo);
    }
    body(data) {
        if (this.method === "POST" || this.method === "PATCH" || this.method === "PUT") {
            return new ApiBuilder(this.method, this.url, this.pathInfo, this.queryInfo, simpleParam(data));
        }
        else {
            throw new APIError(ClientErrorCode.Error, `HTTP Method ${this.method} should not have body.`);
        }
    }
    redirect(redirect) {
        this.redirectOption = redirect;
        return this;
    }
    response() {
        const builder = new ApiBuilder(this.method, this.url, this.pathInfo, this.queryInfo, this.dataInfo);
        return builder.send.bind(builder);
    }
    async send(params, data) {
        let url = this.url;
        for (const key in this.pathInfo) {
            const value = params[key];
            if (value === undefined) {
                if (this.pathInfo[key].optional) {
                    url = url.replace(`{${key}}`, "");
                    continue;
                }
                throw new APIError(ClientErrorCode.InvalidParameter, `Missing path '${key}'`);
            }
            url = url.replace(`{${key}}`, this.pathInfo[key].validator(key, value).toString());
        }
        const queryParams = [];
        for (const key in this.queryInfo) {
            const value = params[key];
            if (value === undefined && !this.queryInfo[key].optional)
                throw new APIError(ClientErrorCode.InvalidParameter, `Missing query param '${key}'`);
            else if (value !== undefined)
                queryParams.push(`${key}=${encodeURIComponent(this.queryInfo[key].validator(key, value).toString())}`);
        }
        if (queryParams.length > 0)
            url = url + "?" + queryParams.join("&");
        if (this.dataInfo !== undefined) {
            for (const key in this.dataInfo) {
                const dataInfo = this.dataInfo[key];
                const value = data[key];
                if (value === undefined && !dataInfo.optional)
                    throw new APIError(ClientErrorCode.InvalidParameter, `Missing field '${key} in request body'`);
                else if (value !== undefined)
                    data[key] = dataInfo.validator(key, value);
            }
        }
        let response;
        try {
            response = await fetch(url, {
                method: this.method,
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: this.redirectOption,
                body: this.dataInfo === undefined ? undefined : JSON.stringify(data),
            });
        }
        catch (err) {
            console.exception(err);
            throw new APIError(ClientErrorCode.NetworkFailure, "Failed to send request.");
        }
        if (response.status >= 400) {
            const body = await this.parseBody(response);
            console.warn(`Server response error: ${body.code.toString(16)}: ${body.msg}`);
            throw new APIError(body.code, body.msg);
        }
        const responseBody = await this.parseBody(response);
        if (responseBody.status == ">_<") {
            console.warn(`Server response error: ${responseBody.code.toString(16)}: ${responseBody.msg}`);
            throw new APIError(responseBody.code, responseBody.msg);
        }
        return responseBody.data;
    }
    async parseBody(response) {
        try {
            const body = await response.json();
            return body;
        }
        catch (err) {
            console.exception(err);
            throw new APIError(ClientErrorCode.ParseError, "Failed to parse response body.");
        }
    }
}
function api(method, url) {
    switch (method) {
        case "POST":
        case "PUT":
        case "PATCH":
            return new ApiBuilder(method, url, {}, {}, {});
        default:
            return new ApiBuilder(method, url, {}, {}, undefined);
    }
}
function formatDateTime(time) {
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const day = time.getDay();
    const hour = time.getHours();
    const minute = time.getMinutes();
    const second = time.getSeconds();
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
const Uid = {
    type: "string",
    validator: validateUid,
};
const Name = {
    type: "string",
    validator: validateName,
};
const Email = {
    type: "string",
    validator: validateEmail,
};
const Url = {
    type: "string",
    validator: validateUrl
};
var HashMethod;
(function (HashMethod) {
    HashMethod["SHA256"] = "SHA256";
    HashMethod["SHA1"] = "SHA1";
    HashMethod["MD5"] = "MD5";
    HashMethod["NoLogin"] = "NoLogin";
})(HashMethod = exports.HashMethod || (exports.HashMethod = {}));
var DocType;
(function (DocType) {
    DocType["PlainText"] = "PlainText";
    DocType["Markdown"] = "Markdown";
    DocType["HTML"] = "HTML";
})(DocType = exports.DocType || (exports.DocType = {}));
const SardineFishAPI = {
    User: {
        checkAuth: api("GET", "/api/user")
            .response(),
        getChallenge: api("GET", "/api/user/{uid}/challenge")
            .path({ uid: Uid })
            .response(),
        login: api("POST", "/api/user/login")
            .body({ uid: Uid, pwd_hash: "string" })
            .response(),
        signup: api("POST", "/api/user/signup")
            .body({
            uid: Uid,
            pwd_hash: "string",
            salt: "string",
            method: "string",
            name: Name,
            email: Email,
            url: Url,
            avatar: Url,
        })
            .response(),
        signout: api("DELETE", "/api/user/session")
            .response(),
        getAvatar: api("GET", "/api/user/{uid}/avatar")
            .path({ uid: Uid })
            .redirect("manual")
            .response(),
        getInfo: api("GET", "/api/user/info")
            .response(),
    },
    Blog: {
        getList: api("GET", "/api/blog")
            .query({
            from: "number",
            count: "number",
        })
            .response(),
        getByPid: api("GET", "/api/blog/{pid}")
            .path({ pid: "number" })
            .response(),
        post: api("POST", "/api/blog")
            .body({
            title: {
                type: "string",
                validator: validateNonEmpty
            },
            tags: "string[]",
            doc_type: "string",
            doc: {
                type: "string",
                validator: validateNonEmpty
            }
        })
            .response(),
        update: api("PUT", "/api/blog/{pid}")
            .path({ pid: "number" })
            .body({
            title: {
                type: "string",
                validator: validateNonEmpty
            },
            tags: "string[]",
            doc_type: "string",
            doc: {
                type: "string",
                validator: validateNonEmpty
            }
        })
            .response(),
        delete: api("DELETE", "/api/blog/{pid}")
            .path({ pid: "number" })
            .response(),
    },
    Note: {
        getList: api("GET", "/api/note")
            .query({
            from: "number",
            count: "number",
        })
            .response(),
        post: api("POST", "/api/note")
            .body({
            name: Name,
            email: {
                type: "string",
                validator: validateEmail,
                optional: true,
            },
            url: {
                type: "string",
                validator: validateUrl,
                optional: true,
            },
            avatar: Url,
            doc_type: "string",
            doc: {
                type: "string",
                validator: validateNonEmpty,
            }
        })
            .response(),
    },
    Comment: {
        getByPid: api("GET", "/api/comment/{pid}")
            .path({ pid: "number" })
            .query({
            depth: {
                type: "number",
                validator: validateByPass,
                optional: true,
            }
        })
            .response(),
        post: api("POST", "/api/comment/{pid}")
            .path({ pid: "number" })
            .body({
            name: Name,
            email: {
                type: "string",
                validator: validateEmail,
                optional: true,
            },
            url: {
                type: "string",
                validator: validateUrl,
                optional: true,
            },
            avatar: Url,
            text: {
                type: "string",
                validator: validateNonEmpty,
            }
        })
            .response(),
        delete: api("DELETE", "/api/comment/{pid}")
            .path({ pid: "number" })
            .response(),
    },
    PostData: {
        getStatsByPid: api("GET", "/api/post/{pid}/stats")
            .path({ pid: "number" })
            .response(),
        like: api("POST", "/api/post/{pid}/like")
            .path({ pid: "number" })
            .response(),
        dislike: api("DELETE", "/api/post/{pid}/like")
            .path({ pid: "number" })
            .response(),
        postMisc: api("POST", "/api/post/misc_post")
            .body({
            description: {
                type: "string",
                validator: validateNonEmpty,
            },
            url: Url,
        })
            .response(),
    },
    DocType,
    HashMethod,
    Utils: {
        formatDateTime: formatDateTime,
    }
};
const SardineFish = window.SardineFish || {};
window.SardineFish = {
    ...SardineFish,
    API: SardineFishAPI
};
exports.default = SardineFishAPI;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_require__("./SardineFish.API.ts");
/******/ })()
;
//# sourceMappingURL=SardineFish.API.js.map