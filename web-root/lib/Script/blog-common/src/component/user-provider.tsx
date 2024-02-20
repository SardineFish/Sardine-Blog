import React, { useEffect, useState } from "react";
import { UserContext } from "../misc";
import { UserInfo, API } from "sardinefish";

export function UserProvider(props: { children: JSX.Element[] | null })
{
    const [login, setLogin] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", avatar: "/static/img/unknown-user-grey.png", url: "#" } as UserInfo);

    const onSetUser = (info: UserInfo) =>
    {
        if (info.name)
        {
            setLogin(true);
            setUserInfo(info);
        }
    };

    useEffect(() =>
    {
        (async () =>
        {
            try
            {
                const info = await API.User.getInfo({});
                setUserInfo(info);
                setLogin(true);
            }
            catch {

            }
        })();
    }, []);

    return (<UserContext.Provider value={{ login, user: userInfo, setUser: onSetUser }}>
        {props.children}
    </UserContext.Provider>);
}