
type HTTPMethodsWithoutBody = "GET" | "HEAD" | "CONNECT" | "DELETE" | "OPTIONS";
type HTTPMethodsWithBody = "POST" | "PUT" | "PATCH";
type HTTPMethods = HTTPMethodsWithBody | HTTPMethodsWithoutBody;

type TypeNames = "number" | "string" | "boolean" | "string[]";

type TypeOfName<T> =
    T extends "number"
    ? number
    : T extends "string"
    ? string
    : T extends "boolean"
    ? boolean
    : T extends "string[]"
    ? string[]
    : never;

type Validator<T> = (key: string, value: T) => T;

type ParamInfo<T extends TypeNames> = T extends any ? {
    type: T,
    validator: Validator<TypeOfName<T>>,
    optional?: true,
} : never;


type OptionalParams<T extends { [key: string]: ParamInfo<TypeNames> }> = {
    [key in keyof T as T[key]["optional"] extends true ? key : never]: TypeOfName<T[key]["type"]>;
}
type RequiredParams<T extends { [key: string]: ParamInfo<TypeNames> }> = {
    [key in keyof T as T[key]["optional"] extends true ? never : key]: TypeOfName<T[key]["type"]>;
}

type ValueType<T extends ParamsDeclare> = Required<RequiredParams<T>> & Partial<OptionalParams<T>>;
// {
//     [key in keyof T]: TypeOfName<T[key]["type"]>
// }

type ParamsDeclare = {
    [key: string]: ParamInfo<TypeNames>,
}
type SimpleParamsDeclare = {
    [key: string]: ParamInfo<TypeNames> | TypeNames;
}
type FullParamsDeclare<T extends SimpleParamsDeclare> = {
    [key in keyof T]: ParamInfo<TypeNames> & (T[key] extends TypeNames ? ParamInfo<T[key]> : T[key]);
}

type ApiFunction<Path extends ParamsDeclare, Query extends ParamsDeclare, Data extends ParamsDeclare | any | undefined, Response>
    = Data extends undefined
    ? (params: ValueType<Path> & ValueType<Query>) => Promise<Response>
    : Data extends ParamsDeclare ? (params: ValueType<Path> & ValueType<Query>, body: ValueType<Data & ParamsDeclare>) => Promise<Response>
    : (params: ValueType<Path> & ValueType<Query>, body: Data) => Promise<Response>


interface ErrorResponse
{
    status: ">_<";
    timestamp: number;
    code: number;
    msg: string;
}

interface SuccessResponse<T>
{
    status: "^_^";
    timestamp: number;
    data: T
}

function validateByPass<T>(_: string, value: T)
{
    return value;
}


function simpleParam<T extends SimpleParamsDeclare>(info: T): FullParamsDeclare<T>
{
    const params = {} as FullParamsDeclare<T>;
    for (const key in info)
    {
        const value = info[key];
        switch (info[key])
        {
            case "number":
                params[key] = <ParamInfo<TypeNames>>{
                    type: "number",
                    validator: validateByPass,
                } as any;
                break;
            case "string":
                params[key] = <ParamInfo<"string">>{
                    type: "string",
                    validator: validateByPass,
                } as any;
                break;
            case "boolean":
                params[key] = <ParamInfo<"boolean">>{
                    type: "boolean",
                    validator: validateByPass,
                } as any;
                break;
            case "string[]":
                params[key] = <ParamInfo<"string[]">>{
                    type: "string[]",
                    validator: validateByPass,
                } as any;
                break;
            default:
                params[key] = value as any;
        }
    }
    return params;
}


function validateEmail(key: string, email: string): string
{
    if (/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email))
        return email;
    throw new APIError(ClientErrorCode.InvalidParameter, `Invalid email address in '${key}'`);
}

function validateUid(key: string, uid: string): string
{
    if (/[_A-Za-z0-9]{6,32}/.test(uid))
        return uid;
    throw new APIError(ClientErrorCode.InvalidParameter, `Invalid username in field '${key}'`);
}

function validateName(key: string, name: string): string
{
    if (/^([^\s][^\t\r\n\f]{0,30}[^\s])|([^\s])$/.test(name))
        return name;
    throw new APIError(ClientErrorCode.InvalidParameter, `Invalid name in '${key}'`);
}

function validateUrl(key: string, url: string): string
{
    return url;
}

function validateNonEmpty(key: string, text: string): string
{
    if (/^\s*$/.test(text))
        throw new APIError(ClientErrorCode.InvalidParameter, `'${key}' cannot be empty`);
    return text;
}

function noValidate<T>(key: string, value: T): T
{
    return value;
}

enum ClientErrorCode
{
    Error = -1,
    InvalidParameter = -2,
    NetworkFailure = -3,
    ParseError = -4,
}

class APIError extends Error
{
    code: number;
    constructor(code: number, message: string)
    {
        super(message);
        this.code = code;
    }
}

class ApiBuilder<Method extends HTTPMethods, Path extends ParamsDeclare, Query extends ParamsDeclare, Data extends ParamsDeclare | any | undefined, Response>
{
    private method: Method;
    private url: string;
    private pathInfo: Path;
    private queryInfo: Query;
    private dataInfo: Data;
    private redirectOption?: "follow" | "error" | "manual";

    constructor(method: Method, url: string, path: Path, query: Query, data: Data)
    {
        this.method = method;
        this.url = url;
        this.pathInfo = path;
        this.queryInfo = query;
        this.dataInfo = data;
    }

    path<NewPath extends SimpleParamsDeclare>(path: NewPath)
    {
        return new ApiBuilder<Method, FullParamsDeclare<NewPath>, Query, Data, Response>(this.method, this.url, simpleParam(path), this.queryInfo, this.dataInfo);
    }
    query<NewQuery extends SimpleParamsDeclare>(query: NewQuery)
    {
        return new ApiBuilder<Method, Path, FullParamsDeclare<NewQuery>, Data, Response>(this.method, this.url, this.pathInfo, simpleParam(query), this.dataInfo);
    }
    body<T>(): ApiBuilder<Method, Path, Query, T, Response>
    body<NewData extends SimpleParamsDeclare>(data: NewData): ApiBuilder<Method, Path, Query, FullParamsDeclare<NewData>, Response>
    body<NewData extends SimpleParamsDeclare | any>(data?: NewData): ApiBuilder<Method, Path, Query, NewData extends SimpleParamsDeclare ? FullParamsDeclare<NewData> : NewData, Response>
    {
        if (this.method === "POST" || this.method === "PATCH" || this.method === "PUT")
        {
            if (!data)
                return new ApiBuilder(this.method, this.url, this.pathInfo, this.queryInfo, null as any) as any;
            return new ApiBuilder(this.method, this.url, this.pathInfo, this.queryInfo, simpleParam(data as SimpleParamsDeclare)) as any;
        }
        else
        {
            throw new APIError(ClientErrorCode.Error, `HTTP Method ${this.method} should not have body.`);
        }
    }
    redirect(redirect: "follow" | "error" | "manual")
    {
        this.redirectOption = redirect;
        return this;
    }
    response<Response>(): ApiFunction<Path, Query, Data, Response>
    {
        const builder = new ApiBuilder<Method, Path, Query, Data, Response>(this.method, this.url, this.pathInfo, this.queryInfo, this.dataInfo);
        return builder.send.bind(builder) as ApiFunction<Path, Query, Data, Response>;
    }
    private async send(params: ValueType<Path> | ValueType<Query>, data: ValueType<Data & ParamsDeclare> | Data): Promise<Response>
    {
        let url = this.url;
        for (const key in this.pathInfo)
        {
            const value = (params as ValueType<Path> as any)[key];
            if (value === undefined)
            {
                if (this.pathInfo[key].optional)
                {
                    url = url.replace(`{${key}}`, "");
                    continue;
                }
                throw new APIError(ClientErrorCode.InvalidParameter, `Missing path '${key}'`);
            }
            url = url.replace(`{${key}}`, this.pathInfo[key].validator(key, value as never).toString());
        }
        const queryParams = [];
        for (const key in this.queryInfo) 
        {
            const value = (params as Partial<ValueType<Query>> as any)[key];
            if (value === undefined && !this.queryInfo[key].optional)
                throw new APIError(ClientErrorCode.InvalidParameter, `Missing query param '${key}'`);
            else if (value !== undefined)
                queryParams.push(`${key}=${encodeURIComponent(this.queryInfo[key].validator(key, value as never).toString())}`);
        }
        if (queryParams.length > 0)
            url = url + "?" + queryParams.join("&");

        if (this.dataInfo !== undefined && this.dataInfo !== null)
        {
            for (const key in this.dataInfo)
            {
                const dataInfo = (this.dataInfo as ParamsDeclare)[key];
                const value = (data as any)[key];
                if (value === undefined && !dataInfo.optional)
                    throw new APIError(ClientErrorCode.InvalidParameter, `Missing field '${key} in request body'`);
                else if (value !== undefined)
                    (data as any)[key] = dataInfo.validator(key, value as never);
            }
        }

        let response: globalThis.Response;
        try
        {
            response = await fetch(url, {
                method: this.method,
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: this.redirectOption,
                body: this.dataInfo === undefined ? undefined : JSON.stringify(data as any),
            });
        }
        catch (err)
        {
            console.error(err);
            throw new APIError(ClientErrorCode.NetworkFailure, "Failed to send request.");
        }

        if (response.status >= 400)
        {
            const body = await this.parseBody<ErrorResponse>(response);
            console.warn(`Server response error: ${body.code.toString(16)}: ${body.msg}`);
            throw new APIError(body.code, body.msg);
        }

        const responseBody = await this.parseBody<SuccessResponse<Response> | ErrorResponse>(response);
        if (responseBody.status == ">_<")
        {
            console.warn(`Server response error: ${responseBody.code.toString(16)}: ${responseBody.msg}`);
            throw new APIError(responseBody.code, responseBody.msg);
        }
        return responseBody.data;
    }
    private async parseBody<T extends ErrorResponse | SuccessResponse<Response>>(response: globalThis.Response)
    {
        try
        {
            const body = await response.json() as T;
            return body as T;
        }
        catch (err)
        {
            console.error(err);
            throw new APIError(ClientErrorCode.ParseError, "Failed to parse response body.");
        }
    }
}

function api<Method extends HTTPMethodsWithBody>(method: Method, url: string): ApiBuilder<Method, {}, {}, {}, any>
function api<Method extends HTTPMethodsWithoutBody>(method: Method, url: string): ApiBuilder<Method, {}, {}, undefined, any>
function api<Method extends HTTPMethods>(method: Method, url: string): ApiBuilder<Method, {}, {}, {} | undefined, any>
{
    switch (method)
    {
        case "POST":
        case "PUT":
        case "PATCH":
            return new ApiBuilder<Method, {}, {}, {}, null>(method, url, {}, {}, {});
        default:
            return new ApiBuilder<Method, {}, {}, undefined, null>(method, url, {}, {}, undefined);
    }
}

function formatDateTime(time: Date)
{
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const day = time.getDate();
    const hour = time.getHours();
    const minute = time.getMinutes();
    const second = time.getSeconds();
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export interface ProgressRequestOptions
{
    method?: HTTPMethods,
    headers?: { [key: string]: string },
    onUploadProgress?: (sentBytes: number, totalBytes: number) => void,
    body?: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array> | null | undefined;
}
interface RequestProgressResponse
{
    status: number,
    statusText: string,
    json: () => Promise<any>,
    text: () => Promise<string>,

}
function requestWithProgress(url: string, options?: ProgressRequestOptions)
{
    return new Promise<RequestProgressResponse>((resolve, reject) =>
    {
        try
        {
            const xhr = new XMLHttpRequest();
            xhr.open(options?.method ?? "GET", url, true);
            if (options?.headers)
            {
                for (const key in options.headers)
                {
                    xhr.setRequestHeader(key, options.headers[key]);
                }
            }
            xhr.upload.onprogress = (ev) =>
            {
                options?.onUploadProgress?.(ev.loaded, ev.total);
            }
            xhr.onreadystatechange = (ev) =>
            {
                if (xhr.readyState !== 4)
                    return;
                
                resolve({
                    status: xhr.status,
                    statusText: xhr.statusText,
                    json: async () => JSON.parse(xhr.responseText),
                    text: async () => xhr.responseText,
                });
            };
            xhr.send(options?.body);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

const Uid = {
    type: "string" as "string",
    validator: validateUid,
};
const Name = {
    type: "string" as "string",
    validator: validateName,
};
const Email = {
    type: "string" as "string",
    validator: validateEmail,
};
const Url = {
    type: "string" as "string",
    validator: validateUrl
};

export enum HashMethod
{
    SHA256 = "SHA256",
    SHA1 = "SHA1",
    MD5 = "MD5",
    NoLogin = "NoLogin",
}
export enum DocType
{
    PlainText = "PlainText",
    Markdown = "Markdown",
    HTML = "HTML",
}

export interface AuthChallenge
{
    salt: string,
    method: HashMethod,
    challenge: string,
}

export interface SessionToken
{
    session_id: string,
    token: string,
    expire: number,
}

export interface PubUserInfo
{
    name: string,
    avatar: string,
    url: string | null,
}

export interface UserInfo extends PubUserInfo
{
    email: string | null,
}

export interface PostStats
{
    views: number,
    likes: number,
    comments: number,
}

export interface BlogPreview
{
    pid: number,
    title: string,
    time: number,
    tags: string[],
    author: PubUserInfo,
    preview: string,
}

export interface Blog
{
    pid: number,
    title: string,
    author: PubUserInfo,
    time: number,
    tags: string[],
    doc_type: DocType,
    doc: string,
    stats: PostStats,
}

export interface BlogContent
{
    title: string,
    tags: string[],
    doc_type: DocType,
    doc: string,
}

export interface Note
{
    pid: number,
    author: PubUserInfo,
    time: number,
    doc_type: DocType,
    doc: string,
    stats: PostStats,
}

export interface Comment
{
    pid: number,
    comment_to: number,
    author: PubUserInfo,
    time: number,
    text: string,
    comments: Comment[],
    depth: number,
}

export interface MiscellaneousPostContent
{
    description: string,
    url: string,
}

export interface OSSUploadInfo
{
    key: string,
    token: string,
    upload: string,
}

export interface RankedScore
{
    name: String,
    score: number,
    time: number,
}

const SardineFishAPI = {
    User: {
        checkAuth: api("GET", "/api/user")
            .response<string>(),
        getChallenge: api("GET", "/api/user/{uid}/challenge")
            .path({ uid: Uid })
            .response<AuthChallenge>(),
        login: api("POST", "/api/user/login")
            .body({ uid: Uid, pwd_hash: "string" })
            .response<SessionToken>(),
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
            .response<SessionToken>(),
        signout: api("DELETE", "/api/user/session")
            .response<null>(),
        getAvatar: api("GET", "/api/user/{uid}/avatar")
            .path({ uid: Uid })
            .redirect("manual")
            .response<string>(),
        avatarUrl: (uid: String) => `/api/user/${uid}/avatar`,
        getInfo: api("GET", "/api/user/info")
            .response<UserInfo>(),
        deleteEmail: api("DELETE", "/api/user/{uid}/info/email")
            .path({ uid: Uid })
            .response<null>(),
    },
    Blog: {
        getList: api("GET", "/api/blog")
            .query({
                from: "number",
                count: "number",
            })
            .response<BlogPreview[]>(),
        getByPid: api("GET", "/api/blog/{pid}")
            .path({ pid: "number" })
            .response<Blog>(),
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
            .response<number>(),
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
            .response<number>(),
        delete: api("DELETE", "/api/blog/{pid}")
            .path({ pid: "number" })
            .response<BlogContent | null>(),
    },
    Note: {
        getList: api("GET", "/api/note")
            .query({
                from: "number",
                count: "number",
            })
            .response<Note[]>(),
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
            .response<number>(),
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
            .response<Comment[]>(),
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
            .response<number>(),
        delete: api("DELETE", "/api/comment/{pid}")
            .path({ pid: "number" })
            .response<null | {
                comment_to: number,
                comment_root: number,
                text: string,
            }>(),
    },
    PostData: {
        getStatsByPid: api("GET", "/api/post/{pid}/stats")
            .path({ pid: "number" })
            .response<PostStats>(),
        like: api("POST", "/api/post/{pid}/like")
            .path({ pid: "number" })
            .response<number>(),
        dislike: api("DELETE", "/api/post/{pid}/like")
            .path({ pid: "number" })
            .response<number>(),
        postMisc: api("POST", "/api/post/misc_post")
            .body({
                description: {
                    type: "string",
                    validator: validateNonEmpty,
                },
                url: Url,
            })
            .response<number>(),
    },
    Storage: {
        getUploadInfo: api("POST", "/api/oss/new")
            .response<OSSUploadInfo>(),
    },
    Rank: {
        getRankedScores: api("GET", "/api/rank/{key}")
            .path({ key: "string" })
            .query({
                skip: {
                    type: "number",
                    optional: true,
                    validator: noValidate,
                },
                count: {
                    type: "number",
                    optional: true,
                    validator: noValidate,
                }
            })
            .response<RankedScore[]>(),
        postScore: api("POST", "/api/rank/{key}")
            .path({ key: "string" })
            .body<{
                name: string,
                score: string,
                data?: any,
            }>()
            .response<number>(),
    },
    DocType,
    HashMethod,
    Utils: {
        formatDateTime: formatDateTime,
        requestProgress: requestWithProgress,
    }
}

const SardineFish = (window as any).SardineFish || {};
(window as any).SardineFish = {
    ...SardineFish,
    API: SardineFishAPI
};

declare global
{
    namespace SardineFish
    {
        const API: typeof SardineFishAPI;
    }
}

export default SardineFishAPI;