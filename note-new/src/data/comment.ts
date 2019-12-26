import { User, UserInfoResponseData, wrapUser } from "./user";
import { registerAPI, Validators, ParamDeclares } from "./api";


export interface Comment
{
    user: User;
    pid: string;
    cid: string;
    time: Date;
    text: string;
}

export interface CommentResponseData extends UserInfoResponseData
{
    pid: string;
    cid: string;
    commentCount: string;
    comments?: CommentResponseData[];
    text: string;
    time: string;
}

function wrapComment(comment: CommentResponseData): Comment
{
    return {
        user: wrapUser(comment),
        pid: comment.pid,
        cid: comment.cid,
        time: new Date(comment.time),
        text: comment.text
    };
}

function flatComment(comment: CommentResponseData | undefined) : Comment[]
{
    if (!comment)
        return [];
    if (!comment.comments)
        return [wrapComment(comment)];
    return [wrapComment(comment), ...comment.comments.flatMap(c => wrapComment(c))];
    
}

const fetchComment = registerAPI<CommentResponseData[]>("/comment/getList.php")({
    cid: "number",
    from: "number",
    count: "number"
});

const postComment = registerAPI<number>("/comment/post.php")({}, {
    cid: "number",
    url: "string",
    name: ParamDeclares.Uid,
    email: ParamDeclares.Email,
    text: ParamDeclares.TextContent
});

export const Comment = {
    get: async (cid: number) =>
    {
        const result = await fetchComment({ cid: cid, from: 0, count: 100 });
        return result.map(comment => flatComment(comment));
    },
    post: postComment
};