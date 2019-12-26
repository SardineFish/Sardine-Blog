
export interface User
{
    name: string;
    uid: string;
    avatar: string;
    url: string;
}

export interface PublicUserInfo
{
    name: string;
    uid: string;
    avatar: string;
    url: string;
}

export interface UserInfoResponseData
{
    uid: string,
    name: string,
    avatar: string,
    url: string;
}

export function wrapUser(info: PublicUserInfo) : PublicUserInfo
{
    return {
        name: info.name,
        avatar: info.avatar ? info.avatar : "https://www.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?d=https%3A%2F%2Fcdn-global-static.sardinefish.com%2Fimg%2Fdecoration%2Funknown-user.png&s=256",
        url: info.url,
        uid: info.uid
    };
}