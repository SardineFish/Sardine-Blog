import React from "react";
export const UserContext = React.createContext({
    login: false,
    user: { name: "", avatar: "/static/img/unknown-user-grey.png", url: "#" },
    setUser: (user) => { }
});
//# sourceMappingURL=user-context.js.map