import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import classnames from "classnames";
import { User } from "../data/user";
import { IconUser } from "../component/icon";
import { NavItem } from "../data/site";

export function Page(props: { title: string, nav: NavItem[], currentNav: string, children?: React.ReactNode })
{
    return (
        <>
            <header className="top-bar">
                <div className="wrapper">
                    <nav className="top-nav">
                        <ul>
                            {props.nav.map(nav => (
                                <li className={classnames("nav-item", { "current": props.currentNav === nav.key })} key={nav.key}>
                                    <a href={nav.url}>{nav.name}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <UserData />
                </div>
            </header>
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
                        <img src={(user.user as User).avatar} alt="avatar" />
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