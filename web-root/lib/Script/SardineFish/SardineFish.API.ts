import { api, HTTPMethods, ParamDescriptor, setBaseUrl, Validators } from "./api-builder";
export { APIError, ClientErrorCode } from "./api-builder";

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
    body?: Document | Blob | BufferSource | FormData | URLSearchParams | string | null | undefined;
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
    validator: Validators.uid,
};
const Name = {
    type: "string" as "string",
    validator: Validators.name,
};
const Email = {
    type: "string" as "string",
    validator: Validators.email,
};
const Url = {
    type: "string" as "string",
    validator: Validators.url
};

export type PidType = number;

export type ServerTime = string;

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
    session_id: string,
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

export interface RecentActivity
{
    action: "PostNote" | "PostComment" | "PostBlog" | "UpdateBlog",
    name: string,
    url: string,
    time: number,
    title?: string,
}

export interface SearchResult
{
    time: number,
    timeout: boolean,
    total_hits: number,
    results: SearchHitInfo[],
}

export interface SearchHitInfo
{
    pid: number,
    time: number,
    author: string,
    title: string,
    preview: string,
    doc_type: "Blog" | "Note",
    tags: string[],
    highlight: SearchHighlight,
}

export interface SearchHighlight
{
    title?: string,
    tags?: string[],
    author?: string,
    content?: string[],
}

export interface PubPostData<T>
{
    pid: PidType,
    time: ServerTime,
    author: PubUserInfo,
    stats: PostStats,
    content: T,
}

export interface RecipeContent
{
    title: string,
    description: string,
    images: string[],
    requirements: string[],
    optional: string[],
    content: string,
}

export type RecipePreviewContent = Omit<RecipeContent, "content">;

export interface GalleryExhibit
{
    title: string,
    description: string,
    url: string,
    meta: Record<string, string>,
}

const ImagePreset = {
    Size600: "s600",
    Size800: "s800",
    Width600: "w600",
    Width1000: "w1k",
    Width1000FullQuality: "w1k_f",
    Width2000: "w2k",
};

const SizeSufix = ["w1k", "w600", "w1k_f", "w2k", "s600", "s800"];

function processSarImgUrl(img: string, preset: keyof typeof ImagePreset)
{
    return removeSarImgSuffix(img) + "-" + ImagePreset[preset];
}

function removeSarImgSuffix(url: string)
{
    const sufx = SizeSufix.filter(sufix => url.endsWith("-" + sufix))[0];
    if (sufx)
    {
        url = url.substring(0, url.length - sufx.length - 1);
    }
    return url;
}

const PageQueryParam = ParamDescriptor(
    {
        from: "number",
        count: "number",
    });

const SardineFishAPI = {
    User: {
        checkAuth: api("GET", "/api/user")
            .response<string>(),
        getChallenge: api("GET", "/api/user/{uid}/challenge")
            .path({ uid: Uid })
            .response<AuthChallenge>(),
        login: api("POST", "/api/user/login")
            .body({
                uid: Uid,
                pwd_hash: "string",
                session_id: { optional: true, type: "string", validator: Validators.bypass }
            })
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
                    validator: Validators.nonEmpty
                },
                tags: "string[]",
                doc_type: "string",
                doc: {
                    type: "string",
                    validator: Validators.nonEmpty
                }
            })
            .response<number>(),
        update: api("PUT", "/api/blog/{pid}")
            .path({ pid: "number" })
            .body({
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
                    validator: Validators.email,
                    optional: true,
                },
                url: {
                    type: "string",
                    validator: Validators.url,
                    optional: true,
                },
                avatar: Url,
                doc_type: "string",
                doc: {
                    type: "string",
                    validator: Validators.nonEmpty,
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
                    validator: Validators.bypass,
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
                    validator: Validators.email,
                    optional: true,
                },
                url: {
                    type: "string",
                    validator: Validators.url,
                    optional: true,
                },
                avatar: Url,
                text: {
                    type: "string",
                    validator: Validators.nonEmpty,
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
                    validator: Validators.nonEmpty,
                },
                url: Url,
            })
            .response<number>(),
        recentActivities: api("GET", "/api/post/recently")
            .query({
                skip: "number",
                count: "number",
            })
            .response<RecentActivity[]>(),
    },
    Storage: {
        getUploadInfo: api("POST", "/api/oss/new")
            .response<OSSUploadInfo>(),
        processImg: processSarImgUrl,
        removeImgSuffix: removeSarImgSuffix,
    },
    Rank: {
        getRankedScores: api("GET", "/api/rank/{key}")
            .path({ key: "string" })
            .query({
                skip: {
                    type: "number",
                    optional: true,
                    validator: Validators.bypass,
                },
                count: {
                    type: "number",
                    optional: true,
                    validator: Validators.bypass,
                }
            })
            .response<RankedScore[]>(),
        postScore: api("POST", "/api/rank/{key}")
            .path({ key: "string" })
            .body<{
                name: string,
                score: number,
                data?: any,
            }>()
            .response<number>(),
    },
    Search: {
        search: api("GET", "/api/search")
            .query({
                q: "string",
                skip: "number",
                count: "number",
            })
            .response<SearchResult>()
    },
    Cook: {
        getList: api("GET", "/api/cook")
            .query(PageQueryParam)
            .response<PubPostData<RecipePreviewContent>[]>(),
        get: api("GET", "/api/cook/{pid}")
            .path({ pid: "number" })
            .response<PubPostData<RecipeContent>>(),
        post: api("POST", "/api/cook")
            .body<RecipeContent>()
            .response<PidType>(),
        update: api("PUT", "/api/cook/{pid}")
            .path({ pid: "number" })
            .body<RecipeContent>()
            .response<number>(),
        delete: api("DELETE", "/api/cook/{pid}")
            .path({ pid: "number" })
            .response<RecipeContent | null>(),
    },
    Gallery: {
        getList: api("GET", "/api/gallery")
            .query(PageQueryParam)
            .response<PubPostData<GalleryExhibit>[]>(),
        get: api("GET", "/api/gallery/{pid}")
            .path({ pid: "number" })
            .response<PubPostData<GalleryExhibit>>(),
        post: api("POST", "/api/gallery")
            .body<GalleryExhibit>()
            .response<PidType>(),
        update: api("PUT", "/api/gallery/{pid}")
            .path({ pid: "number" })
            .body<GalleryExhibit>()
            .response<number>(),
        delete: api("DELETE", "/api/gallery/{pid}")
            .path({ pid: "number" })
            .response<GalleryExhibit | null>(),
    },
    DocType,
    HashMethod,
    Utils: {
        formatDateTime: formatDateTime,
        requestProgress: requestWithProgress,
    },
    setBaseUrl: (url: string) => setBaseUrl(url),
}

interface SardineFish
{
    API: typeof SardineFishAPI
};

let __global = typeof (window) === "undefined" ? global : window;

const SardineFish: SardineFish = (__global as any).SardineFish || {};
(__global as any).SardineFish = {
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

export default SardineFish;

export const API = SardineFishAPI;