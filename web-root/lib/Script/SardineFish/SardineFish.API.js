/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./SardineFish.API.ts":
/*!****************************!*\
  !*** ./SardineFish.API.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocType = exports.HashMethod = void 0;
function validateByPass(_, value) {
    return value;
}
function simpleParam(info) {
    var params = {};
    for (var key in info) {
        var value = info[key];
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
    throw new Error("Invalid email address in '" + key + "'");
}
function validateUid(key, uid) {
    if (/[_A-Za-z0-9]{6,32}/.test(uid))
        return uid;
    throw new Error("Invalid username in field '" + key + "'");
}
function validateName(key, name) {
    if (/^([^\s][^\t\r\n\f]{0,30}[^\s])|([^\s])$/.test(name))
        return name;
    throw new Error("Invalid name in '" + key + "'");
}
function validateUrl(key, url) {
    return url;
}
function validateNonEmpty(key, text) {
    if (/^\s*$/.test(text))
        throw new Error("'" + key + "' cannot be empty");
    return text;
}
var ApiBuilder = /** @class */ (function () {
    function ApiBuilder(method, url, path, query, data) {
        this.method = method;
        this.url = url;
        this.pathInfo = path;
        this.queryInfo = query;
        this.dataInfo = data;
    }
    ApiBuilder.prototype.path = function (path) {
        return new ApiBuilder(this.method, this.url, simpleParam(path), this.queryInfo, this.dataInfo);
    };
    ApiBuilder.prototype.query = function (query) {
        return new ApiBuilder(this.method, this.url, this.pathInfo, simpleParam(query), this.dataInfo);
    };
    ApiBuilder.prototype.body = function (data) {
        if (this.method === "POST" || this.method === "PATCH" || this.method === "PUT") {
            return new ApiBuilder(this.method, this.url, this.pathInfo, this.queryInfo, simpleParam(data));
        }
        else {
            throw new Error("HTTP Method " + this.method + " should not have body.");
        }
    };
    ApiBuilder.prototype.response = function () {
        var builder = new ApiBuilder(this.method, this.url, this.pathInfo, this.queryInfo, this.dataInfo);
        return builder.send.bind(builder);
    };
    ApiBuilder.prototype.send = function (params, data) {
        return __awaiter(this, void 0, void 0, function () {
            var url, key, value, queryParams, key, value, key, dataInfo, value, response, err_1, body, responseBody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.url;
                        for (key in this.pathInfo) {
                            value = params[key];
                            if (value === undefined) {
                                if (this.pathInfo[key].optional) {
                                    url = url.replace("{" + key + "}", "");
                                    continue;
                                }
                                throw new Error("Missing path '" + key + "'");
                            }
                            url = url.replace("{" + key + "}", this.pathInfo[key].validator(key, value).toString());
                        }
                        queryParams = [];
                        for (key in this.queryInfo) {
                            value = params[key];
                            if (value === undefined && !this.queryInfo[key].optional)
                                throw new Error("Missing query param '" + key + "'");
                            else if (value !== undefined)
                                queryParams.push(key + "=" + encodeURIComponent(this.queryInfo[key].validator(key, value).toString()));
                        }
                        url = url + "?" + queryParams.join("&");
                        if (this.dataInfo !== undefined) {
                            for (key in this.dataInfo) {
                                dataInfo = this.dataInfo[key];
                                value = data[key];
                                if (value === undefined && !dataInfo.optional)
                                    throw new Error("Missing field '" + key + " in request body'");
                                else if (value !== undefined)
                                    data[key] = dataInfo.validator(key, value);
                            }
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(url, {
                                method: this.method,
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: this.dataInfo === undefined ? undefined : JSON.stringify(data),
                            })];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.exception(err_1);
                        throw new Error("Failed to send request.");
                    case 4:
                        if (!(response.status >= 400)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.parseBody(response)];
                    case 5:
                        body = _a.sent();
                        throw new Error("Error: " + body.code.toString(16) + ": " + body.msg);
                    case 6: return [4 /*yield*/, this.parseBody(response)];
                    case 7:
                        responseBody = _a.sent();
                        return [2 /*return*/, responseBody.data];
                }
            });
        });
    };
    ApiBuilder.prototype.parseBody = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var body, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, response.json()];
                    case 1:
                        body = _a.sent();
                        return [2 /*return*/, body];
                    case 2:
                        err_2 = _a.sent();
                        console.exception(err_2);
                        throw new Error("Failed to parse response body.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ApiBuilder;
}());
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
var Uid = {
    type: "string",
    validator: validateUid,
};
var Name = {
    type: "string",
    validator: validateName,
};
var Email = {
    type: "string",
    validator: validateEmail,
};
var Url = {
    type: "string",
    validator: validateUrl
};
var HashMethod;
(function (HashMethod) {
    HashMethod["SHA256"] = "SHA256";
})(HashMethod = exports.HashMethod || (exports.HashMethod = {}));
var DocType;
(function (DocType) {
    DocType["PlainText"] = "PlainText";
    DocType["Markdown"] = "Markdown";
    DocType["HTML"] = "HTML";
})(DocType = exports.DocType || (exports.DocType = {}));
var SardineFishAPI = {
    User: {
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
            doc_type: "string",
            doc: {
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
    }
};
var SardineFish = window.SardineFish || {};
window.SardineFish = __assign(__assign({}, SardineFish), { API: SardineFishAPI });
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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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