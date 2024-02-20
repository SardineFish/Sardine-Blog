import React, { useEffect, useState } from "react";
import { UserContext } from "../misc";
import { API } from "sardinefish";
export function UserProvider(props) {
    const [login, setLogin] = useState(false);
    const [userInfo, setUserInfo] = useState({ name: "", avatar: "/static/img/unknown-user-grey.png", url: "#" });
    const onSetUser = (info) => {
        if (info.name) {
            setLogin(true);
            setUserInfo(info);
        }
    };
    useEffect(() => {
        (async () => {
            try {
                const info = await API.User.getInfo({});
                setUserInfo(info);
                setLogin(true);
            }
            catch {
            }
        })();
    }, []);
    return (React.createElement(UserContext.Provider, { value: { login, user: userInfo, setUser: onSetUser } }, props.children));
}
//# sourceMappingURL=user-provider.js.map