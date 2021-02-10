import linq = require("linq");

export interface APIResponse<T>
{
    status: ">_<" | "^_^";
    errorCode: number;
    msg: string;
    data?: T,
    processTime: number;
}

export interface CommentResponseData
{
    avatar: string;
    pid: string;
    cid: string;
    commentCount: string;
    comments?: CommentResponseData[];
    name: string;
    text: string;
    time: string;
    uid: string;
    url: string;
}

export function validateUserName(name: string)
{
    const emptyTest = /^\s*$/;
    const charTest = /^[^`,\"\']+$/;
    if (emptyTest.test(name))
        throw new Error("Name can not be empty.");
    else if (!charTest.test(name))
        throw new Error("Invalid name.");
    return name.replace(/^\s*/, "").replace(/\s*$/, "");
}

export function validateEmail(email: string)
{
    email = email.replace(/^\s*/, "").replace(/\s*$/, "");
    if (email === "")
        return email;
    const reg = /\S+@\S+/;
    if (!reg.test(email))
        throw new Error("Invalid email address.");
    return email;
}

export function validateTextContent(text: string, name:string="Content")
{
    const emptyTest = /^\s*$/;
    if (emptyTest.test(text))
        throw new Error(`${name} cannot be empty.`);
    return text;
}
export function validateNumber(num: number, name: string = "number")
{
    if (typeof (num) !== "number")
        throw new Error(`Invalid ${name}.`);
    return num;
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
    return fetch(baseUrl + queryString, {
        method: postParams === undefined ? "GET" : "POST",
        body: postData,
        headers: header
    });
}

async function requestAPI<T>(baseUrl: string, requestPrams?: MapedObject<any>, postParams?: MapedObject<any>): Promise<T>
{
    const response = (await paramsFetch(baseUrl, requestPrams, postParams).then(response => response.json())) as APIResponse<T>;
    if (response.status != "^_^")
    {
        console.log(`${response.errorCode}: ${response.msg}`);
        throw new Error(response.msg);
    }
    return response.data;
}

export class SarAPI
{
    static Comment = class
    {
        static async Post(cid: number, name: string, email: string, url: string, text: string)
        {
            cid = Math.floor(validateNumber(cid));
            name = validateUserName(name);
            email = validateEmail(email);
            text = validateTextContent(text);
            const pid = (await requestAPI<number>("/comment/post.php", null, {
                "name": name,
                "email": email,
                "text": text,
                "cid": cid,
                "url": url
            }));
            return pid;
        }
    }
}