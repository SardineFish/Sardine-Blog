// api-builder.ts
function ParamDescriptor(p) {
  return p;
}
function simpleParam(info) {
  const params = {};
  for (const key in info) {
    const value = info[key];
    switch (info[key]) {
      case "number":
        params[key] = {
          type: "number",
          validator: validateByPass
        };
        break;
      case "string":
        params[key] = {
          type: "string",
          validator: validateByPass
        };
        break;
      case "boolean":
        params[key] = {
          type: "boolean",
          validator: validateByPass
        };
        break;
      case "string[]":
        params[key] = {
          type: "string[]",
          validator: validateByPass
        };
        break;
      default:
        params[key] = value;
    }
  }
  return params;
}
function validateEmail(key, email) {
  if (/^\w+@[a-zA-Z_]+?(\.[a-zA-Z]+)*$/.test(email))
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
function validateByPass(_, value) {
  return value;
}
function validatePositive(key, value) {
  if (typeof value !== "number")
    throw new APIError(ClientErrorCode.InvalidParameter, `'${key}' should be number`);
  if (value < 0)
    throw new APIError(ClientErrorCode.InvalidParameter, `Invalid value of '${key}'.`);
  return value;
}
var Validators = {
  name: validateName,
  email: validateEmail,
  uid: validateUid,
  url: validateUrl,
  nonEmpty: validateNonEmpty,
  bypass: validateByPass,
  positive: validatePositive
};
var ClientErrorCode = /* @__PURE__ */ ((ClientErrorCode2) => {
  ClientErrorCode2[ClientErrorCode2["Error"] = -1] = "Error";
  ClientErrorCode2[ClientErrorCode2["InvalidParameter"] = -2] = "InvalidParameter";
  ClientErrorCode2[ClientErrorCode2["NetworkFailure"] = -3] = "NetworkFailure";
  ClientErrorCode2[ClientErrorCode2["ParseError"] = -4] = "ParseError";
  return ClientErrorCode2;
})(ClientErrorCode || {});
var APIError = class extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.code = code;
  }
};
var ApiBuilder = class {
  method;
  url;
  pathInfo;
  queryInfo;
  dataInfo;
  redirectOption;
  requestMode;
  constructor(method, mode, url, path, query, data) {
    this.method = method;
    this.url = url;
    this.pathInfo = path;
    this.queryInfo = query;
    this.dataInfo = data;
    this.requestMode = mode;
  }
  base(baseUrl) {
    return new ApiBuilder(this.method, this.requestMode, baseUrl + this.url, this.pathInfo, this.queryInfo, this.dataInfo);
  }
  path(path) {
    return new ApiBuilder(this.method, this.requestMode, this.url, simpleParam(path), this.queryInfo, this.dataInfo);
  }
  mode(mode) {
    return new ApiBuilder(this.method, mode, this.url, this.pathInfo, this.queryInfo, this.dataInfo);
  }
  query(query) {
    return new ApiBuilder(this.method, this.requestMode, this.url, this.pathInfo, simpleParam(query), this.dataInfo);
  }
  body(data) {
    if (this.method === "POST" || this.method === "PATCH" || this.method === "PUT") {
      if (!data)
        return new ApiBuilder(this.method, this.requestMode, this.url, this.pathInfo, this.queryInfo, null);
      return new ApiBuilder(this.method, this.requestMode, this.url, this.pathInfo, this.queryInfo, simpleParam(data));
    } else {
      throw new APIError(-1 /* Error */, `HTTP Method ${this.method} should not have body.`);
    }
  }
  redirect(redirect) {
    this.redirectOption = redirect;
    return this;
  }
  response() {
    const builder = new ApiBuilder(this.method, this.requestMode, this.url, this.pathInfo, this.queryInfo, this.dataInfo);
    return builder.send.bind(builder);
  }
  async send(params, data) {
    let url = this.url;
    for (const key in this.pathInfo) {
      const value = params[key];
      if (value === void 0) {
        if (this.pathInfo[key].optional) {
          url = url.replace(`{${key}}`, "");
          continue;
        }
        throw new APIError(-2 /* InvalidParameter */, `Missing path '${key}'`);
      }
      url = url.replace(`{${key}}`, this.pathInfo[key].validator(key, value).toString());
    }
    const queryParams = [];
    for (const key in this.queryInfo) {
      const value = params[key];
      if (value === void 0 && !this.queryInfo[key].optional)
        throw new APIError(-2 /* InvalidParameter */, `Missing query param '${key}'`);
      else if (value !== void 0)
        queryParams.push(`${key}=${encodeURIComponent(this.queryInfo[key].validator(key, value).toString())}`);
    }
    if (queryParams.length > 0)
      url = url + "?" + queryParams.join("&");
    if (this.dataInfo !== void 0 && this.dataInfo !== null) {
      for (const key in this.dataInfo) {
        const dataInfo = this.dataInfo[key];
        const value = data[key];
        if (value === void 0 && !dataInfo.optional)
          throw new APIError(-2 /* InvalidParameter */, `Missing field '${key} in request body'`);
        else if (value !== void 0)
          data[key] = dataInfo.validator(key, value);
      }
    }
    let response;
    try {
      const headers = {};
      if (this.method === "POST" || this.method === "PUT" || this.method === "OPTIONS")
        headers["Content-Type"] = "application/json";
      response = await fetch(url, {
        method: this.method,
        headers,
        mode: this.requestMode,
        redirect: this.redirectOption,
        body: this.dataInfo === void 0 ? void 0 : JSON.stringify(data)
      });
    } catch (err) {
      throw new APIError(-3 /* NetworkFailure */, "Failed to send request.");
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
    } catch (err) {
      throw new APIError(-3 /* NetworkFailure */, `${response.status} ${response.statusText}`);
    }
  }
};
function api(method, url) {
  switch (method) {
    case "POST":
    case "PUT":
    case "PATCH":
      return new ApiBuilder(method, "cors", url, {}, {}, {});
    default:
      return new ApiBuilder(method, "cors", url, {}, {}, void 0);
  }
}

// SardineFish.API.ts
function formatDateTime(time) {
  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const day = time.getDate();
  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
function requestWithProgress(url, options) {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open(options?.method ?? "GET", url, true);
      if (options?.headers) {
        for (const key in options.headers) {
          xhr.setRequestHeader(key, options.headers[key]);
        }
      }
      xhr.upload.onprogress = (ev) => {
        options?.onUploadProgress?.(ev.loaded, ev.total);
      };
      xhr.onreadystatechange = (ev) => {
        if (xhr.readyState !== 4)
          return;
        resolve({
          status: xhr.status,
          statusText: xhr.statusText,
          json: async () => JSON.parse(xhr.responseText),
          text: async () => xhr.responseText
        });
      };
      xhr.send(options?.body);
    } catch (err) {
      reject(err);
    }
  });
}
var Uid = {
  type: "string",
  validator: Validators.uid
};
var Name = {
  type: "string",
  validator: Validators.name
};
var Email = {
  type: "string",
  validator: Validators.email
};
var Url = {
  type: "string",
  validator: Validators.url
};
var HashMethod = /* @__PURE__ */ ((HashMethod2) => {
  HashMethod2["SHA256"] = "SHA256";
  HashMethod2["SHA1"] = "SHA1";
  HashMethod2["MD5"] = "MD5";
  HashMethod2["NoLogin"] = "NoLogin";
  return HashMethod2;
})(HashMethod || {});
var DocType = /* @__PURE__ */ ((DocType2) => {
  DocType2["PlainText"] = "PlainText";
  DocType2["Markdown"] = "Markdown";
  DocType2["HTML"] = "HTML";
  return DocType2;
})(DocType || {});
var ImagePreset = {
  Size600: "s600",
  Size800: "s800",
  Width600: "w600",
  Width1000: "w1k",
  Width1000FullQuality: "w1k_f",
  Width2000: "w2k"
};
var SizeSufix = ["w1k", "w600", "w1k_f", "w2k", "s600", "s800"];
function processSarImgUrl(img, preset) {
  return removeSarImgSuffix(img) + "-" + ImagePreset[preset];
}
function removeSarImgSuffix(url) {
  const sufx = SizeSufix.filter((sufix) => url.endsWith("-" + sufix))[0];
  if (sufx) {
    url = url.substring(0, url.length - sufx.length - 1);
  }
  return url;
}
var PageQueryParam = ParamDescriptor({
  from: "number",
  count: "number"
});
var SardineFishAPI = {
  User: {
    checkAuth: api("GET", "/api/user").response(),
    getChallenge: api("GET", "/api/user/{uid}/challenge").path({ uid: Uid }).response(),
    login: api("POST", "/api/user/login").body({ uid: Uid, pwd_hash: "string" }).response(),
    signup: api("POST", "/api/user/signup").body({
      uid: Uid,
      pwd_hash: "string",
      salt: "string",
      method: "string",
      name: Name,
      email: Email,
      url: Url,
      avatar: Url
    }).response(),
    signout: api("DELETE", "/api/user/session").response(),
    getAvatar: api("GET", "/api/user/{uid}/avatar").path({ uid: Uid }).redirect("manual").response(),
    avatarUrl: (uid) => `/api/user/${uid}/avatar`,
    getInfo: api("GET", "/api/user/info").response(),
    deleteEmail: api("DELETE", "/api/user/{uid}/info/email").path({ uid: Uid }).response()
  },
  Blog: {
    getList: api("GET", "/api/blog").query({
      from: "number",
      count: "number"
    }).response(),
    getByPid: api("GET", "/api/blog/{pid}").path({ pid: "number" }).response(),
    post: api("POST", "/api/blog").body({
      title: {
        type: "string",
        validator: Validators.nonEmpty
      },
      tags: "string[]",
      doc_type: "string",
      doc: {
        type: "string",
        validator: Validators.nonEmpty
      }
    }).response(),
    update: api("PUT", "/api/blog/{pid}").path({ pid: "number" }).body({
      title: {
        type: "string",
        validator: Validators.nonEmpty
      },
      tags: "string[]",
      doc_type: "string",
      doc: {
        type: "string",
        validator: Validators.nonEmpty
      }
    }).response(),
    delete: api("DELETE", "/api/blog/{pid}").path({ pid: "number" }).response()
  },
  Note: {
    getList: api("GET", "/api/note").query({
      from: "number",
      count: "number"
    }).response(),
    post: api("POST", "/api/note").body({
      name: Name,
      email: {
        type: "string",
        validator: Validators.email,
        optional: true
      },
      url: {
        type: "string",
        validator: Validators.url,
        optional: true
      },
      avatar: Url,
      doc_type: "string",
      doc: {
        type: "string",
        validator: Validators.nonEmpty
      }
    }).response()
  },
  Comment: {
    getByPid: api("GET", "/api/comment/{pid}").path({ pid: "number" }).query({
      depth: {
        type: "number",
        validator: Validators.bypass,
        optional: true
      }
    }).response(),
    post: api("POST", "/api/comment/{pid}").path({ pid: "number" }).body({
      name: Name,
      email: {
        type: "string",
        validator: Validators.email,
        optional: true
      },
      url: {
        type: "string",
        validator: Validators.url,
        optional: true
      },
      avatar: Url,
      text: {
        type: "string",
        validator: Validators.nonEmpty
      }
    }).response(),
    delete: api("DELETE", "/api/comment/{pid}").path({ pid: "number" }).response()
  },
  PostData: {
    getStatsByPid: api("GET", "/api/post/{pid}/stats").path({ pid: "number" }).response(),
    like: api("POST", "/api/post/{pid}/like").path({ pid: "number" }).response(),
    dislike: api("DELETE", "/api/post/{pid}/like").path({ pid: "number" }).response(),
    postMisc: api("POST", "/api/post/misc_post").body({
      description: {
        type: "string",
        validator: Validators.nonEmpty
      },
      url: Url
    }).response(),
    recentActivities: api("GET", "/api/post/recently").query({
      skip: "number",
      count: "number"
    }).response()
  },
  Storage: {
    getUploadInfo: api("POST", "/api/oss/new").response(),
    processImg: processSarImgUrl,
    removeImgSuffix: removeSarImgSuffix
  },
  Rank: {
    getRankedScores: api("GET", "/api/rank/{key}").path({ key: "string" }).query({
      skip: {
        type: "number",
        optional: true,
        validator: Validators.bypass
      },
      count: {
        type: "number",
        optional: true,
        validator: Validators.bypass
      }
    }).response(),
    postScore: api("POST", "/api/rank/{key}").path({ key: "string" }).body().response()
  },
  Search: {
    search: api("GET", "/api/search").query({
      q: "string",
      skip: "number",
      count: "number"
    }).response()
  },
  Cook: {
    getList: api("GET", "/api/cook").query(PageQueryParam).response(),
    get: api("GET", "/api/cook/{pid}").path({ pid: "number" }).response(),
    post: api("POST", "/api/cook").body().response(),
    update: api("PUT", "/api/cook/{pid}").path({ pid: "number" }).body().response(),
    delete: api("DELETE", "/api/cook/{pid}").path({ pid: "number" }).response()
  },
  DocType,
  HashMethod,
  Utils: {
    formatDateTime,
    requestProgress: requestWithProgress
  }
};
var SardineFish = window.SardineFish || {};
window.SardineFish = {
  ...SardineFish,
  API: SardineFishAPI
};
var SardineFish_API_default = SardineFish;
var API = SardineFishAPI;
export {
  API,
  APIError,
  ClientErrorCode,
  DocType,
  HashMethod,
  SardineFish_API_default as default
};
