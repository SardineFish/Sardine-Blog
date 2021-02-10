import { registerAPI } from "./api";

export interface PostData
{
    views: number;
    likes: number;
    comments: number;
}

const hitLike = registerAPI<number>("/postData/doLike.php")({}, {
    pid: "number"
});

export const PostData = {
    hitLike: hitLike
};