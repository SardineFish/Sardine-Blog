
interface APIResponse<T>
{
    status: ">_<" | "^_^";
    errorCode: number;
    msg: string;
    data?: T,
    processTime: number;
}

type Validator<T = any> = (value: T) => T;

function typeVlidator(type: string): Validator
{
    return (x: any) =>
    {
        if (typeof x !== type)
            throw new Error(`Require type to be '${type}'.`);
        return x;
    }
}
function emptyVlidator() : Validator
{
    return (x: any) => x;
}
function emailValidator(name: string = "Email") : Validator<string>
{
    return (email: string) =>
    {
        email = email.replace(/^\s*/, "").replace(/\s*$/, "");
        if (email === "")
            return email;
        const reg = /\S+@\S+/;
        if (!reg.test(email))
            throw new Error("Invalid email address.");
        return email;
    };
}
function userNameValidator() : Validator<string>
{
    return (name: string) =>
    {
        const emptyTest = /^\s*$/;
        const charTest = /^[^`,\"\']+$/;
        if (emptyTest.test(name))
            throw new Error("Name can not be empty.");
        else if (!charTest.test(name))
            throw new Error("Invalid name.");
        return name.replace(/^\s*/, "").replace(/\s*$/, "");
    };
}
function textContentValidator(name: string = "Content") : Validator<string>
{
    return (text: string) =>
    {
        const emptyTest = /^\s*$/;
        if (emptyTest.test(text))
            throw new Error(`${name} cannot be empty.`);
        return text;
    }
}
function numberValidator(name: string = "Number") : Validator<number>
{
    return (num: number) =>
    {
        if (typeof (num) !== "number")
            throw new Error(`Invalid ${name}.`);
        return num;
    }
}
type MapedObject<T> = { [key: string]: T };
function paramsFetch(baseUrl: string, requestPrams?: MapedObject<any>, postParams?: MapedObject<any>)
{
    let queryString = "";
    let postData = "";
    const header = new Headers();
    header.append("Content-Type", "application/x-www-form-urlencoded");
    if (requestPrams)
        queryString = "?" + Object.keys(requestPrams).map(key => `${key}=${encodeURIComponent(requestPrams[key])}`).join("&");
    if (postParams)
        postData = Object.keys(postParams).map(key => `${key}=${encodeURIComponent(postParams[key])}`).join("&");
    
    if (postParams === undefined)
    {
        return fetch(baseUrl + queryString, {
            method: "GET",
            headers: header
        });
    }
    else
    {
        return fetch(baseUrl + queryString, {
            method: "POST",
            body: postData,
            headers: header
        });   
    }
}

type PropsValidator = (value: any) => any;
interface NumberValidator extends PropsValidator { }
interface StringValidator extends PropsValidator { }
type PropsDeclare = "number" | "string" | "boolean" | PropsValidationDeclare;
interface PropsValidationDeclare
{
    type: "number" | "string" | "boolean";
    validator: Validator;
    required?: boolean;
}
interface PropsValidation
{
    key: string;
    type: "number" | "string" | "boolean";
    required: boolean;
    validator: Validator<number | string | boolean>;
}

type TypeCast<T, C, S = C> = T extends C ? S : never;

type PropsTypeCast<T> =
    TypeCast<T, "number", number> |
    TypeCast<T, "string", string> |
    TypeCast<T, "boolean", boolean>;

type PropsDeclareTypeCast<T extends PropsDeclare> =
    PropsTypeCast<T> |
    (T extends PropsValidationDeclare ? (PropsTypeCast<T["type"]>) : never);

type FormDataDeclare = { [key: string]: PropsDeclare };

type FormDataObject<T extends FormDataDeclare, K extends keyof T = keyof T> = { [key in K]: PropsDeclareTypeCast<T[key]> }; 


export function registerAPI<TResult>(url: string) :
    (<TQuery extends FormDataDeclare, TPostData extends FormDataDeclare>(queryDeclare?: TQuery, postDeclare?: TPostData, postProcess?: (result: TResult) => TResult) => 
        (query?: FormDataObject<TQuery>, postData?: FormDataObject<TPostData>) =>
            Promise<TResult>)
{
    return (queryDeclare?, postDeclare?, postProcess?) =>
    {
        let expandedQueryDeclares = queryDeclare && mapPropsDeclare(queryDeclare);
        let expandedPostDeclares = postDeclare && mapPropsDeclare(postDeclare);
        let queryObject: MapedObject<any>;
        let postObject: MapedObject<any>;
        return async (query?, postData?): Promise<TResult> =>
        {
            if (expandedQueryDeclares)
            {
                if (!query)
                    throw new Error("Query params required.");
                queryObject = {};
                for (const prop of expandedQueryDeclares)
                {
                    if (query.hasOwnProperty(prop.key))
                    {
                        queryObject[prop.key] = prop.validator(query[prop.key]);
                    }
                }
            }
            if (expandedPostDeclares)
            {
                if (!postData)
                    throw new Error("Post data required.");
                postObject = {};
                for (const prop of expandedPostDeclares)
                {
                    if (postData.hasOwnProperty(prop.key))
                        postObject[prop.key] = prop.validator(postData[prop.key]);
                }
            }
            const response = (await paramsFetch(url, queryObject, postObject).then(response => response.json())) as APIResponse<TResult>;
            if (response.status != "^_^")
            {
                console.log(`${response.errorCode}: ${response.msg}`);
                throw new Error(response.msg);
            }
            return postProcess ? postProcess(response.data as TResult) : response.data as TResult;
        };
    }    
}

function mapPropsDeclare<T extends FormDataDeclare, K extends keyof T>(declares: T): PropsValidation[]
{
    return Object.keys(declares).map(key => ({
        key: key,
        type: (typeof declares[key] === "object") ? (declares[key] as PropsValidationDeclare).type : declares[key] as any,
        validator: (typeof declares[key] === "object") ? (declares[key] as PropsValidationDeclare).validator : typeVlidator(declares[key] as string),
        required: (typeof declares[key] === "object") ? (declares[key] as PropsValidationDeclare).required as any : false
    }));
}

export const getCurrentUnixTime = () => Date.now() / 1000;

export const Validators = {
    usernameValidator: userNameValidator,
    emailValidator: emailValidator,
    textContentValidator: textContentValidator
};

export const ParamDeclares = {
    Uid: <PropsValidationDeclare>{
        type: "string",
        validator: userNameValidator()
    },
    Email: <PropsValidationDeclare>{
        type: "string",
        validator: emailValidator()
    },
    TextContent: <PropsValidationDeclare>{
        type: "string",
        validator: textContentValidator()
    }
};

export interface PostEntity
{
    pid: number;
}