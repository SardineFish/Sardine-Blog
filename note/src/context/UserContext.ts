import React from "react";
import { PublicUserInfo } from "../data/user";

export const UserContext = React.createContext({
    login: false,
    user: { name: "", uid: "", avatar: "/static/img/unknown-user-grey.png", url: "#" } as PublicUserInfo,
    setUser: (user: PublicUserInfo) => { }
});