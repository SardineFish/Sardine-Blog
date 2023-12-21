import { HTTPMethods } from "./api-builder";
export { APIError, ClientErrorCode } from "./api-builder";
declare function formatDateTime(time: Date): string;
export interface ProgressRequestOptions
{
    method?: HTTPMethods;
    headers?: {
        [key: string]: string;
    };
    onUploadProgress?: (sentBytes: number, totalBytes: number) => void;
    body?: Document | Blob | BufferSource | FormData | URLSearchParams | string | null | undefined;
}
interface RequestProgressResponse
{
    status: number;
    statusText: string;
    json: () => Promise<any>;
    text: () => Promise<string>;
}
declare function requestWithProgress(url: string, options?: ProgressRequestOptions): Promise<RequestProgressResponse>;
export declare type PidType = number;
export declare type ServerTime = string;
export declare enum HashMethod
{
    SHA256 = "SHA256",
    SHA1 = "SHA1",
    MD5 = "MD5",
    NoLogin = "NoLogin"
}
export declare enum DocType
{
    PlainText = "PlainText",
    Markdown = "Markdown",
    HTML = "HTML"
}
export interface AuthChallenge
{
    salt: string;
    method: HashMethod;
    challenge: string;
    session_id: string;
}
export interface SessionToken
{
    session_id: string;
    token: string;
    expire: number;
}
export interface PubUserInfo
{
    name: string;
    avatar: string;
    url: string | null;
}
export interface UserInfo extends PubUserInfo
{
    email: string | null;
}
export interface PostStats
{
    views: number;
    likes: number;
    comments: number;
}
export interface BlogPreview
{
    pid: number;
    title: string;
    time: number;
    tags: string[];
    author: PubUserInfo;
    preview: string;
}
export interface Blog
{
    pid: number;
    title: string;
    author: PubUserInfo;
    time: number;
    tags: string[];
    doc_type: DocType;
    doc: string;
    stats: PostStats;
}
export interface BlogContent
{
    title: string;
    tags: string[];
    doc_type: DocType;
    doc: string;
}
export interface Note
{
    pid: number;
    author: PubUserInfo;
    time: number;
    doc_type: DocType;
    doc: string;
    stats: PostStats;
}
export interface Comment
{
    pid: number;
    comment_to: number;
    author: PubUserInfo;
    time: number;
    text: string;
    comments: Comment[];
    depth: number;
}
export interface MiscellaneousPostContent
{
    description: string;
    url: string;
}
export interface OSSUploadInfo
{
    key: string;
    token: string;
    upload: string;
}
export interface RankedScore
{
    name: String;
    score: number;
    time: number;
}
export interface RecentActivity
{
    action: "PostNote" | "PostComment" | "PostBlog" | "UpdateBlog";
    name: string;
    url: string;
    time: number;
    title?: string;
}
export interface SearchResult
{
    time: number;
    timeout: boolean;
    total_hits: number;
    results: SearchHitInfo[];
}
export interface SearchHitInfo
{
    pid: number;
    time: number;
    author: string;
    title: string;
    preview: string;
    doc_type: "Blog" | "Note";
    tags: string[];
    highlight: SearchHighlight;
}
export interface SearchHighlight
{
    title?: string;
    tags?: string[];
    author?: string;
    content?: string[];
}
export interface PubPostData<T>
{
    pid: PidType;
    time: ServerTime;
    author: PubUserInfo;
    stats: PostStats;
    content: T;
}
export interface RecipeContent
{
    title: string;
    description: string;
    images: string[];
    requirements: string[];
    optional: string[];
    content: string;
}
export declare type RecipePreviewContent = Omit<RecipeContent, "content">;
export declare type ExhibitMeta = string | number | Record<string, ExhibitMeta> | ExhibitMeta[];
export interface GalleryExhibit<T extends Record<string, ExhibitMeta> = Record<string, ExhibitMeta>>
{
    title: string;
    description: string;
    url: string;
    meta: T;
}
declare const ImagePreset: {
    Size600: string;
    Size800: string;
    Width600: string;
    Width1000: string;
    Width1000FullQuality: string;
    Width2000: string;
};
declare function processSarImgUrl(img: string, preset: keyof typeof ImagePreset): string;
declare function removeSarImgSuffix(url: string): string;
declare const SardineFishAPI: {
    User: {
        checkAuth: ((params: Required<{}> & Partial<{}>) => Promise<string>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>) => Promise<string>;
        };
        getChallenge: ((params: Required<{
            uid: string;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<AuthChallenge>) & {
            auth(session_id: string, token: string): (params: Required<{
                uid: string;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<AuthChallenge>;
        };
        login: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            uid: string;
            pwd_hash: string;
        }> & Partial<{
            session_id: string;
        }>) => Promise<SessionToken>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                uid: string;
                pwd_hash: string;
            }> & Partial<{
                session_id: string;
            }>) => Promise<SessionToken>;
        };
        signup: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            uid: string;
            pwd_hash: string;
            salt: string;
            method: string;
            name: string;
            email: string;
            url: string;
            avatar: string;
        }> & Partial<{}>) => Promise<SessionToken>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                uid: string;
                pwd_hash: string;
                salt: string;
                method: string;
                name: string;
                email: string;
                url: string;
                avatar: string;
            }> & Partial<{}>) => Promise<SessionToken>;
        };
        signout: ((params: Required<{}> & Partial<{}>) => Promise<null>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>) => Promise<null>;
        };
        getAvatar: ((params: Required<{
            uid: string;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<string>) & {
            auth(session_id: string, token: string): (params: Required<{
                uid: string;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<string>;
        };
        avatarUrl: (uid: String) => string;
        getInfo: ((params: Required<{}> & Partial<{}>) => Promise<UserInfo>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>) => Promise<UserInfo>;
        };
        deleteEmail: ((params: Required<{
            uid: string;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<null>) & {
            auth(session_id: string, token: string): (params: Required<{
                uid: string;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<null>;
        };
    };
    Blog: {
        getList: ((params: Required<{}> & Partial<{}> & Required<{
            from: number;
            count: number;
        }> & Partial<{}>) => Promise<BlogPreview[]>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                from: number;
                count: number;
            }> & Partial<{}>) => Promise<BlogPreview[]>;
        };
        getByPid: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<Blog>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<Blog>;
        };
        post: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            title: string;
            tags: string[];
            doc_type: string;
            doc: string;
        }> & Partial<{}>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                title: string;
                tags: string[];
                doc_type: string;
                doc: string;
            }> & Partial<{}>) => Promise<number>;
        };
        update: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            title: string;
            tags: string[];
            doc_type: string;
            doc: string;
        }> & Partial<{}>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                title: string;
                tags: string[];
                doc_type: string;
                doc: string;
            }> & Partial<{}>) => Promise<number>;
        };
        delete: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<BlogContent | null>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<BlogContent | null>;
        };
    };
    Note: {
        getList: ((params: Required<{}> & Partial<{}> & Required<{
            from: number;
            count: number;
        }> & Partial<{}>) => Promise<Note[]>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                from: number;
                count: number;
            }> & Partial<{}>) => Promise<Note[]>;
        };
        post: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            name: string;
            avatar: string;
            doc_type: string;
            doc: string;
        }> & Partial<{
            email: string;
            url: string;
        }>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                name: string;
                avatar: string;
                doc_type: string;
                doc: string;
            }> & Partial<{
                email: string;
                url: string;
            }>) => Promise<number>;
        };
    };
    Comment: {
        getByPid: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{
            depth: number;
        }>) => Promise<Comment[]>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{
                depth: number;
            }>) => Promise<Comment[]>;
        };
        post: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            name: string;
            avatar: string;
            text: string;
        }> & Partial<{
            email: string;
            url: string;
        }>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                name: string;
                avatar: string;
                text: string;
            }> & Partial<{
                email: string;
                url: string;
            }>) => Promise<number>;
        };
        delete: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<{
            comment_to: number;
            comment_root: number;
            text: string;
        } | null>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<{
                comment_to: number;
                comment_root: number;
                text: string;
            } | null>;
        };
    };
    PostData: {
        getStatsByPid: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PostStats>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PostStats>;
        };
        like: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
        }> & Partial<{}>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
            }> & Partial<{}>) => Promise<number>;
        };
        dislike: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<number>;
        };
        postMisc: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            description: string;
            url: string;
        }> & Partial<{}>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                description: string;
                url: string;
            }> & Partial<{}>) => Promise<number>;
        };
        recentActivities: ((params: Required<{}> & Partial<{}> & Required<{
            skip: number;
            count: number;
        }> & Partial<{}>) => Promise<RecentActivity[]>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                skip: number;
                count: number;
            }> & Partial<{}>) => Promise<RecentActivity[]>;
        };
    };
    Storage: {
        getUploadInfo: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
        }> & Partial<{}>) => Promise<OSSUploadInfo>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
            }> & Partial<{}>) => Promise<OSSUploadInfo>;
        };
        processImg: typeof processSarImgUrl;
        removeImgSuffix: typeof removeSarImgSuffix;
    };
    Rank: {
        getRankedScores: ((params: Required<{
            key: string;
        }> & Partial<{}> & Required<{}> & Partial<{
            skip: number;
            count: number;
        }>) => Promise<RankedScore[]>) & {
            auth(session_id: string, token: string): (params: Required<{
                key: string;
            }> & Partial<{}> & Required<{}> & Partial<{
                skip: number;
                count: number;
            }>) => Promise<RankedScore[]>;
        };
        postScore: ((params: Required<{
            key: string;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: {
            name: string;
            score: number;
            data?: any;
        }) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                key: string;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: {
                name: string;
                score: number;
                data?: any;
            }) => Promise<number>;
        };
    };
    Search: {
        search: ((params: Required<{}> & Partial<{}> & Required<{
            q: string;
            skip: number;
            count: number;
        }> & Partial<{}>) => Promise<SearchResult>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                q: string;
                skip: number;
                count: number;
            }> & Partial<{}>) => Promise<SearchResult>;
        };
    };
    Cook: {
        getList: ((params: Required<{}> & Partial<{}> & Required<{
            from: number;
            count: number;
        }> & Partial<{}>) => Promise<PubPostData<Pick<RecipeContent, "optional" | "description" | "title" | "images" | "requirements">>[]>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                from: number;
                count: number;
            }> & Partial<{}>) => Promise<PubPostData<Pick<RecipeContent, "optional" | "description" | "title" | "images" | "requirements">>[]>;
        };
        get: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PubPostData<RecipeContent>>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PubPostData<RecipeContent>>;
        };
        post: ((params: Required<{}> & Partial<{}>, body: RecipeContent) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: RecipeContent) => Promise<number>;
        };
        update: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: RecipeContent) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: RecipeContent) => Promise<number>;
        };
        delete: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<RecipeContent | null>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<RecipeContent | null>;
        };
    };
    Gallery: {
        getList: ((params: Required<{}> & Partial<{}> & Required<{
            from: number;
            count: number;
        }> & Partial<{}>) => Promise<PubPostData<GalleryExhibit<Record<string, ExhibitMeta>>>[]>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                from: number;
                count: number;
            }> & Partial<{}>) => Promise<PubPostData<GalleryExhibit<Record<string, ExhibitMeta>>>[]>;
        };
        get: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PubPostData<GalleryExhibit<Record<string, ExhibitMeta>>>>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PubPostData<GalleryExhibit<Record<string, ExhibitMeta>>>>;
        };
        post: ((params: Required<{}> & Partial<{}>, body: GalleryExhibit<Record<string, ExhibitMeta>>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: GalleryExhibit<Record<string, ExhibitMeta>>) => Promise<number>;
        };
        update: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: GalleryExhibit<Record<string, ExhibitMeta>>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: GalleryExhibit<Record<string, ExhibitMeta>>) => Promise<number>;
        };
        delete: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<GalleryExhibit<Record<string, ExhibitMeta>> | null>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<GalleryExhibit<Record<string, ExhibitMeta>> | null>;
        };
    };
    DocType: typeof DocType;
    HashMethod: typeof HashMethod;
    Utils: {
        formatDateTime: typeof formatDateTime;
        requestProgress: typeof requestWithProgress;
    };
    setBaseUrl: (url: string) => void;
};
interface SardineFish
{
    API: typeof SardineFishAPI;
}
declare const SardineFish: SardineFish;
declare global
{
    namespace SardineFish
    {
        const API: typeof SardineFishAPI;
    }
}
export default SardineFish;
export declare const API: {
    User: {
        checkAuth: ((params: Required<{}> & Partial<{}>) => Promise<string>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>) => Promise<string>;
        };
        getChallenge: ((params: Required<{
            uid: string;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<AuthChallenge>) & {
            auth(session_id: string, token: string): (params: Required<{
                uid: string;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<AuthChallenge>;
        };
        login: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            uid: string;
            pwd_hash: string;
        }> & Partial<{
            session_id: string;
        }>) => Promise<SessionToken>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                uid: string;
                pwd_hash: string;
            }> & Partial<{
                session_id: string;
            }>) => Promise<SessionToken>;
        };
        signup: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            uid: string;
            pwd_hash: string;
            salt: string;
            method: string;
            name: string;
            email: string;
            url: string;
            avatar: string;
        }> & Partial<{}>) => Promise<SessionToken>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                uid: string;
                pwd_hash: string;
                salt: string;
                method: string;
                name: string;
                email: string;
                url: string;
                avatar: string;
            }> & Partial<{}>) => Promise<SessionToken>;
        };
        signout: ((params: Required<{}> & Partial<{}>) => Promise<null>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>) => Promise<null>;
        };
        getAvatar: ((params: Required<{
            uid: string;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<string>) & {
            auth(session_id: string, token: string): (params: Required<{
                uid: string;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<string>;
        };
        avatarUrl: (uid: String) => string;
        getInfo: ((params: Required<{}> & Partial<{}>) => Promise<UserInfo>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>) => Promise<UserInfo>;
        };
        deleteEmail: ((params: Required<{
            uid: string;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<null>) & {
            auth(session_id: string, token: string): (params: Required<{
                uid: string;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<null>;
        };
    };
    Blog: {
        getList: ((params: Required<{}> & Partial<{}> & Required<{
            from: number;
            count: number;
        }> & Partial<{}>) => Promise<BlogPreview[]>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                from: number;
                count: number;
            }> & Partial<{}>) => Promise<BlogPreview[]>;
        };
        getByPid: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<Blog>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<Blog>;
        };
        post: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            title: string;
            tags: string[];
            doc_type: string;
            doc: string;
        }> & Partial<{}>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                title: string;
                tags: string[];
                doc_type: string;
                doc: string;
            }> & Partial<{}>) => Promise<number>;
        };
        update: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            title: string;
            tags: string[];
            doc_type: string;
            doc: string;
        }> & Partial<{}>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                title: string;
                tags: string[];
                doc_type: string;
                doc: string;
            }> & Partial<{}>) => Promise<number>;
        };
        delete: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<BlogContent | null>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<BlogContent | null>;
        };
    };
    Note: {
        getList: ((params: Required<{}> & Partial<{}> & Required<{
            from: number;
            count: number;
        }> & Partial<{}>) => Promise<Note[]>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                from: number;
                count: number;
            }> & Partial<{}>) => Promise<Note[]>;
        };
        post: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            name: string;
            avatar: string;
            doc_type: string;
            doc: string;
        }> & Partial<{
            email: string;
            url: string;
        }>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                name: string;
                avatar: string;
                doc_type: string;
                doc: string;
            }> & Partial<{
                email: string;
                url: string;
            }>) => Promise<number>;
        };
    };
    Comment: {
        getByPid: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{
            depth: number;
        }>) => Promise<Comment[]>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{
                depth: number;
            }>) => Promise<Comment[]>;
        };
        post: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            name: string;
            avatar: string;
            text: string;
        }> & Partial<{
            email: string;
            url: string;
        }>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                name: string;
                avatar: string;
                text: string;
            }> & Partial<{
                email: string;
                url: string;
            }>) => Promise<number>;
        };
        delete: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<{
            comment_to: number;
            comment_root: number;
            text: string;
        } | null>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<{
                comment_to: number;
                comment_root: number;
                text: string;
            } | null>;
        };
    };
    PostData: {
        getStatsByPid: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PostStats>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PostStats>;
        };
        like: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
        }> & Partial<{}>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
            }> & Partial<{}>) => Promise<number>;
        };
        dislike: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<number>;
        };
        postMisc: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
            description: string;
            url: string;
        }> & Partial<{}>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
                description: string;
                url: string;
            }> & Partial<{}>) => Promise<number>;
        };
        recentActivities: ((params: Required<{}> & Partial<{}> & Required<{
            skip: number;
            count: number;
        }> & Partial<{}>) => Promise<RecentActivity[]>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                skip: number;
                count: number;
            }> & Partial<{}>) => Promise<RecentActivity[]>;
        };
    };
    Storage: {
        getUploadInfo: ((params: Required<{}> & Partial<{}>, body: Required<{
            [x: string]: string | number | boolean | string[];
        }> & Partial<{}>) => Promise<OSSUploadInfo>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: Required<{
                [x: string]: string | number | boolean | string[];
            }> & Partial<{}>) => Promise<OSSUploadInfo>;
        };
        processImg: typeof processSarImgUrl;
        removeImgSuffix: typeof removeSarImgSuffix;
    };
    Rank: {
        getRankedScores: ((params: Required<{
            key: string;
        }> & Partial<{}> & Required<{}> & Partial<{
            skip: number;
            count: number;
        }>) => Promise<RankedScore[]>) & {
            auth(session_id: string, token: string): (params: Required<{
                key: string;
            }> & Partial<{}> & Required<{}> & Partial<{
                skip: number;
                count: number;
            }>) => Promise<RankedScore[]>;
        };
        postScore: ((params: Required<{
            key: string;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: {
            name: string;
            score: number;
            data?: any;
        }) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                key: string;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: {
                name: string;
                score: number;
                data?: any;
            }) => Promise<number>;
        };
    };
    Search: {
        search: ((params: Required<{}> & Partial<{}> & Required<{
            q: string;
            skip: number;
            count: number;
        }> & Partial<{}>) => Promise<SearchResult>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                q: string;
                skip: number;
                count: number;
            }> & Partial<{}>) => Promise<SearchResult>;
        };
    };
    Cook: {
        getList: ((params: Required<{}> & Partial<{}> & Required<{
            from: number;
            count: number;
        }> & Partial<{}>) => Promise<PubPostData<Pick<RecipeContent, "optional" | "description" | "title" | "images" | "requirements">>[]>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                from: number;
                count: number;
            }> & Partial<{}>) => Promise<PubPostData<Pick<RecipeContent, "optional" | "description" | "title" | "images" | "requirements">>[]>;
        };
        get: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PubPostData<RecipeContent>>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PubPostData<RecipeContent>>;
        };
        post: ((params: Required<{}> & Partial<{}>, body: RecipeContent) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: RecipeContent) => Promise<number>;
        };
        update: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: RecipeContent) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: RecipeContent) => Promise<number>;
        };
        delete: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<RecipeContent | null>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<RecipeContent | null>;
        };
    };
    Gallery: {
        getList: ((params: Required<{}> & Partial<{}> & Required<{
            from: number;
            count: number;
        }> & Partial<{}>) => Promise<PubPostData<GalleryExhibit<Record<string, ExhibitMeta>>>[]>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}> & Required<{
                from: number;
                count: number;
            }> & Partial<{}>) => Promise<PubPostData<GalleryExhibit<Record<string, ExhibitMeta>>>[]>;
        };
        get: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PubPostData<GalleryExhibit<Record<string, ExhibitMeta>>>>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<PubPostData<GalleryExhibit<Record<string, ExhibitMeta>>>>;
        };
        post: ((params: Required<{}> & Partial<{}>, body: GalleryExhibit<Record<string, ExhibitMeta>>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{}> & Partial<{}>, body: GalleryExhibit<Record<string, ExhibitMeta>>) => Promise<number>;
        };
        update: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>, body: GalleryExhibit<Record<string, ExhibitMeta>>) => Promise<number>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>, body: GalleryExhibit<Record<string, ExhibitMeta>>) => Promise<number>;
        };
        delete: ((params: Required<{
            pid: number;
        }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<GalleryExhibit<Record<string, ExhibitMeta>> | null>) & {
            auth(session_id: string, token: string): (params: Required<{
                pid: number;
            }> & Partial<{}> & Required<{}> & Partial<{}>) => Promise<GalleryExhibit<Record<string, ExhibitMeta>> | null>;
        };
    };
    DocType: typeof DocType;
    HashMethod: typeof HashMethod;
    Utils: {
        formatDateTime: typeof formatDateTime;
        requestProgress: typeof requestWithProgress;
    };
    setBaseUrl: (url: string) => void;
};
