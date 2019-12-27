import { User, UserInfoResponseData, wrapUser } from "./user";
import { registerAPI, Validators, ParamDeclares } from "./api";


export interface Comment
{
    user: User;
    pid: number;
    cid: number;
    time: Date;
    text: string;
    replies: Comment[];
    replyTo?: Comment;
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

function traverseComments(comment: Comment, collection: Map<number, Comment> = new Map()): Map<number, Comment>
{
    collection.set(comment.pid, comment);
    comment.replies.forEach(c => traverseComments(c, collection));
    return collection;
}

function buildConnection(comment: Comment, collection: Map<number, Comment>)
{
    comment.replyTo = collection.has(comment.cid)
        ? collection.get(comment.cid)
        : undefined;
    comment.replies.forEach(c => buildConnection(c, collection));
}

function wrapComment(comment: CommentResponseData): Comment
{
    return {
        user: wrapUser(comment),
        pid: parseInt(comment.pid),
        cid: parseInt(comment.cid),
        time: new Date(comment.time),
        text: comment.text,
        replies: comment.comments === undefined ? [] : comment.comments.map(c => wrapComment(c))
    };
}

function flatComment(comment: Comment | undefined) : Comment[]
{
    if (!comment)
        return [];
    if (!comment.replies)
        return [comment];
    comment.replies = [...comment.replies.flatMap(c => flatComment(c))];
    return [comment, ...comment.replies];
    
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
        const comments = result.map(comment => wrapComment(comment));
        comments.forEach(comment =>
        {
            const collection = traverseComments(comment);
            buildConnection(comment, collection);
            flatComment(comment);
        });
        return comments;
    },
    post: postComment
};