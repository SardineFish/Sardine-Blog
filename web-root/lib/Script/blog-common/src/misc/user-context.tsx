import React from "react";

import { UserInfo } from "sardinefish";

export const UserContext = React.createContext({
    login: false,
    user: { name: "", avatar: "/static/img/unknown-user-grey.png", url: "#" } as UserInfo,
    setUser: (user: UserInfo) => { }
});