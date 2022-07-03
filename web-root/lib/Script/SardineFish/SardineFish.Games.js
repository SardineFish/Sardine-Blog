(() => {
  // api-builder.ts
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

  // SardineFish.Games.ts
  var GameAPI = (baseUrl = "") => ({
    Rank: {
      getRankedScores: api("GET", "/api/rank/{key}").base(baseUrl).path({ key: "string" }).query({
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
      postScore: api("POST", "/api/rank/{key}").base(baseUrl).path({ key: "string" }).body().response()
    }
  });
  var SardineFish = window.SardineFish || {};
  window.SardineFish = {
    ...SardineFish,
    Games: GameAPI
  };
  var SardineFish_Games_default = GameAPI;
})();
