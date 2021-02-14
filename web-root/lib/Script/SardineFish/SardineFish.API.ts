
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

type ApiFunction<Path extends ParamsDeclare, Query extends ParamsDeclare, Data extends ParamsDeclare | undefined, Response>
    = Data extends undefined
    ? (params: ValueType<Path> & ValueType<Query>) => Promise<Response>
    : (params: ValueType<Path> & ValueType<Query>, body: ValueType<Data & ParamsDeclare>) => Promise<Response>;


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
    throw new Error(`Invalid email address in '${key}'`);
}

function validateUid(key: string, uid: string): string
{
    if (/[_A-Za-z0-9]{6,32}/.test(uid))
        return uid;
    throw new Error(`Invalid username in field '${key}'`);
}

function validateName(key: string, name: string): string
{
    if (/^([^\s][^\t\r\n\f]{0,30}[^\s])|([^\s])$/.test(name))
        return name;
    throw new Error(`Invalid name in '${key}'`);
}

function validateUrl(key: string, url: string): string
{
    return url;
}

function validateNonEmpty(key: string, text: string): string
{
    if (/^\s*$/.test(text))
        throw new Error(`'${key}' cannot be empty`);
    return text;
}

class ApiBuilder<Method extends HTTPMethods, Path extends ParamsDeclare, Query extends ParamsDeclare, Data extends ParamsDeclare | undefined, Response>
{
    private method: Method;
    private url: string;
    private pathInfo: Path;
    private queryInfo: Query;
    private dataInfo: Data;
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
    body<NewData extends SimpleParamsDeclare>(data: NewData)
    {
        if (this.method === "POST" || this.method === "PATCH" || this.method === "PUT")
        {
            return new ApiBuilder<Method, Path, Query, FullParamsDeclare<NewData>, Response>(this.method, this.url, this.pathInfo, this.queryInfo, simpleParam(data));
        }
        else
        {
            throw new Error(`HTTP Method ${this.method} should not have body.`);
        }
    }
    response<Response>(): ApiFunction<Path, Query, Data, Response>
    {
        const builder = new ApiBuilder<Method, Path, Query, Data, Response>(this.method, this.url, this.pathInfo, this.queryInfo, this.dataInfo);
        return builder.send.bind(builder) as ApiFunction<Path, Query, Data, Response>;
    }
    private async send(params: ValueType<Path> | ValueType<Query>, data: ValueType<Data & ParamsDeclare>): Promise<Response>
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
                throw new Error(`Missing path '${key}'`);
            }
            url = url.replace(`{${key}}`, this.pathInfo[key].validator(key, value as never).toString());
        }
        const queryParams = [];
        for (const key in this.queryInfo) 
        {
            const value = (params as Partial<ValueType<Query>> as any)[key];
            if (value === undefined && !this.queryInfo[key].optional)
                throw new Error(`Missing query param '${key}'`);
            else if (value !== undefined)
                queryParams.push(`${key}=${encodeURIComponent(this.queryInfo[key].validator(key, value as never).toString())}`);
        }
        url = url + "?" + queryParams.join("&");

        if (this.dataInfo !== undefined)
        {
            for (const key in this.dataInfo)
            {
                const dataInfo = this.dataInfo[key];
                const value = (data as any)[key];
                if (value === undefined && !dataInfo.optional)
                    throw new Error(`Missing field '${key} in request body'`);
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
                body: this.dataInfo === undefined ? undefined : JSON.stringify(data as any),
            });
        }
        catch (err)
        {
            console.exception(err);
            throw new Error("Failed to send request.");
        }

        if (response.status >= 400)
        {
            const body = await this.parseBody<ErrorResponse>(response);
            throw new Error(`Error: ${body.code.toString(16)}: ${body.msg}`);
        }

        const responseBody = await this.parseBody<SuccessResponse<Response>>(response);
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
            console.exception(err);
            throw new Error("Failed to parse response body.");
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
}
export enum DocType
{
    PlainText = "PlainText",
    Markdown = "Markdown",
    HTML = "HTML",
}

interface AuthChallenge
{
    salt: string,
    method: HashMethod,
    challenge: string,
}

interface SessionToken
{
    session_id: string,
    token: string,
    expire: number,
}

interface PubUserInfo
{
    name: string,
    avatar: string,
    url: string | null,
}

interface PostStats
{
    views: number,
    likes: number,
    comments: number,
}

interface BlogPreview
{
    pid: number,
    title: string,
    time: string,
    tags: string[],
    author: PubUserInfo,
    preview: string,
}

interface Blog
{
    pid: number,
    title: string,
    author: PubUserInfo,
    time: string,
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

interface Note
{
    pid: number,
    author: PubUserInfo,
    time: string,
    doc_type: DocType,
    doc: string,
    stats: PostStats,
}

interface Comment
{
    pid: number,
    comment_to: number,
    author: PubUserInfo,
    time: string,
    text: string,
    comments: Comment[],
    depth: number,
}

export interface MiscellaneousPostContent
{
    description: string,
    url: string,
}

const SardineFishAPI = {
    User: {
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
                doc_type: "string",
                doc: {
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