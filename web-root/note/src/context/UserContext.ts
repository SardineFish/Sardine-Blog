import React from "react";
import { UserInfo } from "../../../lib/Script/SardineFish/SardineFish.API";

export const UserContext = React.createContext({
    login: false,
    user: { name: "", avatar: "/static/img/unknown-user-grey.png", url: "#" } as UserInfo,
    setUser: (user: UserInfo) => { }
});