import { UserInfoResponseData, PublicUserInfo, wrapUser } from "./user";
import { PostEntity, registerAPI, ParamDeclares } from "./api";
import { PostData } from "./postData";

export interface Note extends PostEntity
{
    text: string;
    time: string;
    author: PublicUserInfo;
    postData: PostData;
}

const fetchNotes = registerAPI<Note[]>("/api/note/getList.php")({
    startIdx: "number",
    count: "number",
    time: "number"
}, undefined, notes => notes.map(note =>
{
    note.author = wrapUser(note.author);
    return note;
}));

const postNote = registerAPI<number>("/api/note/post.php")({}, {
    author: ParamDeclares.Uid,
    email: ParamDeclares.Email,
    url: "string",
    text: ParamDeclares.TextContent
});

export const NoteBoard =
{
    get: fetchNotes,
    post: postNote
};