import React from "react";
import { User } from "../data/user";

export const UserContext = React.createContext({
    login: false,
    user: { name: "", uid: "", avatar: "/static/img/unknown-user-grey.png", url: "#" } as User,
    setUser: (user: User) => { }
});