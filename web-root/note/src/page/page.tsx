import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import classnames from "classnames";
import { PublicUserInfo } from "../data/user";
import { IconUser, IconMenu } from "../component/icon";
import { NavItem } from "../data/site";
import { FoldView } from "../component/fold-view";

export function Page(props: { title: string, nav: NavItem[], currentNav: string, children?: React.ReactNode })
{
    return (
        <>
            <PageHeader title={props.title} nav={props.nav} currentNav={props.currentNav} />
            <main className="page-content">
                {props.children}
            </main>
            <footer className="page-footer">
                <p className="powered-by">POWERED BY SardineFish</p>
                <p className="copyright">Copyright © 2015-{new Date().getFullYear()} SardineFish, All Rights Reserved</p>
            </footer>
        </>
    );
}

function UserData()
{
    const user = useContext(UserContext);
    return (
        <aside className="user-data">
            {user.login
                ? <div className="avatar">
                    <a href="/account/user/face/upload.html">
                        <img src={(user.user as PublicUserInfo).avatar} alt="avatar" />
                    </a>
                </div>
                : <div className="avatar empty">
                    <a href="/account/login">
                        <IconUser/>
                    </a>
                </div>
            }
        </aside>
    )
}

function PageHeader(props: { nav: NavItem[], currentNav: string, title: string })
{
    const [extendNav, setExtend] = useState(false);
    const menuClick = () =>
    {
        setExtend(!extendNav);
    };
    return (
        <header className={classnames("top-bar", {"extend": extendNav})}>
            <div className="wrapper">
                <div className="title">{props.title}</div>
                <FoldView extend={extendNav}>
                    <nav className="top-nav">
                        <ul>
                            {props.nav.map(nav => (
                                <li className={classnames("nav-item", { "current": props.currentNav === nav.key })} key={nav.key}>
                                    <a href={nav.url}>{nav.name}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </FoldView>
                <UserData />
                <IconMenu onClick={menuClick}/>
            </div>
            <div className="dim"></div>
        </header>
    );
}