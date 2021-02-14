declare type TypeNames = "number" | "string" | "boolean" | "string[]";
declare type TypeOfName<T> = T extends "number" ? number : T extends "string" ? string : T extends "boolean" ? boolean : T extends "string[]" ? string[] : never;
declare type Validator<T> = (key: string, value: T) => T;
declare type ParamInfo<T extends TypeNames> = T extends any ? {
    type: T;
    validator: Validator<TypeOfName<T>>;
    optional?: true;
} : never;
declare type OptionalParams<T extends {
    [key: string]: ParamInfo<TypeNames>;
}> = {
    [key in keyof T as T[key]["optional"] extends true ? key : never]: TypeOfName<T[key]["type"]>;
};
declare type RequiredParams<T extends {
    [key: string]: ParamInfo<TypeNames>;
}> = {
    [key in keyof T as T[key]["optional"] extends true ? never : key]: TypeOfName<T[key]["type"]>;
};
declare type ValueType<T extends ParamsDeclare> = Required<RequiredParams<T>> & Partial<OptionalParams<T>>;
declare type ParamsDeclare = {
    [key: string]: ParamInfo<TypeNames>;
};
declare type SimpleParamsDeclare = {
    [key: string]: ParamInfo<TypeNames> | TypeNames;
};
declare type FullParamsDeclare<T extends SimpleParamsDeclare> = {
    [key in keyof T]: ParamInfo<TypeNames> & (T[key] extends TypeNames ? ParamInfo<T[key]> : T[key]);
};
declare function validateByPass<T>(_: string, value: T): T;
declare function validateEmail(key: string, email: string): string;
declare function validateUid(key: string, uid: string): string;
declare function validateName(key: string, name: string): string;
declare function validateUrl(key: string, url: string): string;
declare function validateNonEmpty(key: string, text: string): string;
export declare enum HashMethod {
    SHA256 = "SHA256"
}
export declare enum DocType {
    PlainText = "PlainText",
    Markdown = "Markdown",
    HTML = "HTML"
}
interface AuthChallenge {
    salt: string;
    method: HashMethod;
    challenge: string;
}
interface SessionToken {
    session_id: string;
    token: string;
    expire: number;
}
interface PubUserInfo {
    name: string;
    avatar: string;
    url: string | null;
}
interface PostStats {
    views: number;
    likes: number;
    comments: number;
}
interface BlogPreview {
    pid: number;
    title: string;
    time: string;
    tags: string[];
    author: PubUserInfo;
    preview: string;
}
interface Blog {
    pid: number;
    title: string;
    author: PubUserInfo;
    time: string;
    tags: string[];
    doc_type: DocType;
    doc: string;
    stats: PostStats;
}
export interface BlogContent {
    title: string;
    tags: string[];
    doc_type: DocType;
    doc: string;
}
interface Note {
    pid: number;
    author: PubUserInfo;
    time: string;
    doc_type: DocType;
    doc: string;
    stats: PostStats;
}
interface Comment {
    pid: number;
    comment_to: number;
    author: PubUserInfo;
    time: string;
    text: string;
    comments: Comment[];
    depth: number;
}
export interface MiscellaneousPostContent {
    description: string;
    url: string;
}
declare const SardineFishAPI: {
    User: {
        checkAuth: (params: ValueType<{}>) => Promise<string>;
        getChallenge: (params: Required<RequiredParams<FullParamsDeclare<{
            uid: {
                type: "string";
                validator: typeof validateUid;
            };
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            uid: {
                type: "string";
                validator: typeof validateUid;
            };
        }>>> & Required<RequiredParams<{}>> & Partial<OptionalParams<{}>>) => Promise<AuthChallenge>;
        login: (params: ValueType<{}>, body: ValueType<FullParamsDeclare<{
            uid: {
                type: "string";
                validator: typeof validateUid;
            };
            pwd_hash: "string";
        }> & ParamsDeclare>) => Promise<SessionToken>;
        signup: (params: ValueType<{}>, body: ValueType<FullParamsDeclare<{
            uid: {
                type: "string";
                validator: typeof validateUid;
            };
            pwd_hash: "string";
            salt: "string";
            method: "string";
            name: {
                type: "string";
                validator: typeof validateName;
            };
            email: {
                type: "string";
                validator: typeof validateEmail;
            };
            url: {
                type: "string";
                validator: typeof validateUrl;
            };
            avatar: {
                type: "string";
                validator: typeof validateUrl;
            };
        }> & ParamsDeclare>) => Promise<SessionToken>;
        signout: (params: ValueType<{}>) => Promise<null>;
        getAvatar: (params: Required<RequiredParams<FullParamsDeclare<{
            uid: {
                type: "string";
                validator: typeof validateUid;
            };
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            uid: {
                type: "string";
                validator: typeof validateUid;
            };
        }>>> & Required<RequiredParams<{}>> & Partial<OptionalParams<{}>>) => Promise<string>;
    };
    Blog: {
        getList: (params: Required<RequiredParams<{}>> & Partial<OptionalParams<{}>> & Required<RequiredParams<FullParamsDeclare<{
            from: "number";
            count: "number";
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            from: "number";
            count: "number";
        }>>>) => Promise<BlogPreview[]>;
        getByPid: (params: Required<RequiredParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Required<RequiredParams<{}>> & Partial<OptionalParams<{}>>) => Promise<Blog>;
        post: (params: ValueType<{}>, body: ValueType<FullParamsDeclare<{
            title: {
                type: "string";
                validator: typeof validateNonEmpty;
            };
            tags: "string[]";
            doc_type: "string";
            doc: {
                type: "string";
                validator: typeof validateNonEmpty;
            };
        }> & ParamsDeclare>) => Promise<number>;
        update: (params: Required<RequiredParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Required<RequiredParams<{}>> & Partial<OptionalParams<{}>>, body: ValueType<FullParamsDeclare<{
            title: {
                type: "string";
                validator: typeof validateNonEmpty;
            };
            tags: "string[]";
            doc_type: "string";
            doc: {
                type: "string";
                validator: typeof validateNonEmpty;
            };
        }> & ParamsDeclare>) => Promise<number>;
        delete: (params: Required<RequiredParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Required<RequiredParams<{}>> & Partial<OptionalParams<{}>>) => Promise<BlogContent | null>;
    };
    Note: {
        getList: (params: Required<RequiredParams<{}>> & Partial<OptionalParams<{}>> & Required<RequiredParams<FullParamsDeclare<{
            from: "number";
            count: "number";
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            from: "number";
            count: "number";
        }>>>) => Promise<Note[]>;
        post: (params: ValueType<{}>, body: ValueType<FullParamsDeclare<{
            name: {
                type: "string";
                validator: typeof validateName;
            };
            email: {
                type: "string";
                validator: typeof validateEmail;
                optional: true;
            };
            url: {
                type: "string";
                validator: typeof validateUrl;
                optional: true;
            };
            avatar: {
                type: "string";
                validator: typeof validateUrl;
            };
            doc_type: "string";
            doc: {
                type: "string";
                validator: typeof validateNonEmpty;
            };
        }> & ParamsDeclare>) => Promise<number>;
    };
    Comment: {
        getByPid: (params: Required<RequiredParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Required<RequiredParams<FullParamsDeclare<{
            depth: {
                type: "number";
                validator: typeof validateByPass;
                optional: true;
            };
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            depth: {
                type: "number";
                validator: typeof validateByPass;
                optional: true;
            };
        }>>>) => Promise<Comment[]>;
        post: (params: Required<RequiredParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Required<RequiredParams<{}>> & Partial<OptionalParams<{}>>, body: ValueType<FullParamsDeclare<{
            name: {
                type: "string";
                validator: typeof validateName;
            };
            email: {
                type: "string";
                validator: typeof validateEmail;
                optional: true;
            };
            url: {
                type: "string";
                validator: typeof validateUrl;
                optional: true;
            };
            avatar: {
                type: "string";
                validator: typeof validateUrl;
            };
            doc_type: "string";
            doc: {
                type: "string";
                validator: typeof validateNonEmpty;
            };
        }> & ParamsDeclare>) => Promise<number>;
        delete: (params: Required<RequiredParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Required<RequiredParams<{}>> & Partial<OptionalParams<{}>>) => Promise<{
            comment_to: number;
            comment_root: number;
            text: string;
        } | null>;
    };
    PostData: {
        getStatsByPid: (params: Required<RequiredParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Required<RequiredParams<{}>> & Partial<OptionalParams<{}>>) => Promise<PostStats>;
        like: (params: Required<RequiredParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Required<RequiredParams<{}>> & Partial<OptionalParams<{}>>, body: ValueType<ParamsDeclare>) => Promise<number>;
        dislike: (params: Required<RequiredParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Partial<OptionalParams<FullParamsDeclare<{
            pid: "number";
        }>>> & Required<RequiredParams<{}>> & Partial<OptionalParams<{}>>) => Promise<number>;
        postMisc: (params: ValueType<{}>, body: ValueType<FullParamsDeclare<{
            description: {
                type: "string";
                validator: typeof validateNonEmpty;
            };
            url: {
                type: "string";
                validator: typeof validateUrl;
            };
        }> & ParamsDeclare>) => Promise<number>;
    };
};
declare global {
    namespace SardineFish {
        const API: typeof SardineFishAPI;
    }
}
export default SardineFishAPI;
