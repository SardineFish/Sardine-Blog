
type HTTPMethodsWithoutBody = "GET" | "HEAD" | "CONNECT" | "DELETE" | "OPTIONS";
type HTTPMethodsWithBody = "POST" | "PUT" | "PATCH";
export type HTTPMethods = HTTPMethodsWithBody | HTTPMethodsWithoutBody;

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


export function simpleParam<T extends SimpleParamsDeclare>(info: T): FullParamsDeclare<T>
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

function validateByPass<T>(_: string, value: T)
{
    return value;
}

function validatePositive(key: String, value: number): number
{
    if (typeof (value) !== "number")
        throw new APIError(ClientErrorCode.InvalidParameter, `'${key}' should be number`);
    if (value < 0)
        throw new APIError(ClientErrorCode.InvalidParameter, `Invalid value of '${key}'.`);
    return value;
}

export const Validators = {
    name: validateName,
    email: validateEmail,
    uid: validateUid,
    url: validateUrl,
    nonEmpty: validateNonEmpty,
    bypass: validateByPass,
    positive: validatePositive,
}

export enum ClientErrorCode
{
    Error = -1,
    InvalidParameter = -2,
    NetworkFailure = -3,
    ParseError = -4,
}

export class APIError extends Error
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
    private requestMode: RequestMode;

    constructor(method: Method, mode: RequestMode, url: string, path: Path, query: Query, data: Data)
    {
        this.method = method;
        this.url = url;
        this.pathInfo = path;
        this.queryInfo = query;
        this.dataInfo = data;
        this.requestMode = mode;
    }

    base(baseUrl: string)
    {
        return new ApiBuilder(this.method, this.requestMode, baseUrl + this.url, this.pathInfo, this.queryInfo, this.dataInfo);
    }
    path<NewPath extends SimpleParamsDeclare>(path: NewPath)
    {
        return new ApiBuilder<Method, FullParamsDeclare<NewPath>, Query, Data, Response>(this.method, this.requestMode, this.url, simpleParam(path), this.queryInfo, this.dataInfo);
    }
    mode(mode: RequestMode)
    {
        return new ApiBuilder(this.method, mode, this.url, this.pathInfo, this.queryInfo, this.dataInfo);
    }
    query<NewQuery extends SimpleParamsDeclare>(query: NewQuery)
    {
        return new ApiBuilder<Method, Path, FullParamsDeclare<NewQuery>, Data, Response>(this.method, this.requestMode, this.url, this.pathInfo, simpleParam(query), this.dataInfo);
    }
    body<T>(): ApiBuilder<Method, Path, Query, T, Response>
    body<NewData extends SimpleParamsDeclare>(data: NewData): ApiBuilder<Method, Path, Query, FullParamsDeclare<NewData>, Response>
    body<NewData extends SimpleParamsDeclare | any>(data?: NewData): ApiBuilder<Method, Path, Query, NewData extends SimpleParamsDeclare ? FullParamsDeclare<NewData> : NewData, Response>
    {
        if (this.method === "POST" || this.method === "PATCH" || this.method === "PUT")
        {
            if (!data)
                return new ApiBuilder(this.method, this.requestMode, this.url, this.pathInfo, this.queryInfo, null as any) as any;
            return new ApiBuilder(this.method, this.requestMode, this.url, this.pathInfo, this.queryInfo, simpleParam(data as SimpleParamsDeclare)) as any;
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
        const builder = new ApiBuilder<Method, Path, Query, Data, Response>(this.method, this.requestMode, this.url, this.pathInfo, this.queryInfo, this.dataInfo);
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
            const headers: HeadersInit = {};
            if (this.method === "POST" || this.method === "PUT" || this.method === "OPTIONS")
                headers["Content-Type"] = "application/json";
                
            response = await fetch(url, {
                method: this.method,
                headers: headers,
                mode: this.requestMode,
                redirect: this.redirectOption,
                body: this.dataInfo === undefined ? undefined : JSON.stringify(data as any),
            });
        }
        catch (err)
        {
            // console.error(err);
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
            // console.error(err);
            throw new APIError(ClientErrorCode.NetworkFailure, `${response.status} ${response.statusText}`);
        }
    }
}

export function api<Method extends HTTPMethodsWithBody>(method: Method, url: string): ApiBuilder<Method, {}, {}, {}, any>
export function api<Method extends HTTPMethodsWithoutBody>(method: Method, url: string): ApiBuilder<Method, {}, {}, undefined, any>
export function api<Method extends HTTPMethods>(method: Method, url: string): ApiBuilder<Method, {}, {}, {} | undefined, any>
{
    switch (method)
    {
        case "POST":
        case "PUT":
        case "PATCH":
            return new ApiBuilder<Method, {}, {}, {}, null>(method, "cors", url, {}, {}, {});
        default:
            return new ApiBuilder<Method, {}, {}, undefined, null>(method, "cors", url, {}, {}, undefined);
    }
}