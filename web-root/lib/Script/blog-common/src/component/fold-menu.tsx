import React from "react";
import clsx from "clsx";
import { Icons, useToggle } from "../misc";
import { IconButton } from "./button";

export function FoldMenu(props: { className: string, title?: string, children?: React.ReactNode, icon?: JSX.Element})
{
    const icon = props.icon ?? <Icons.Menu/>
    const [expand, toggleExpand] = useToggle(false);
    return (<aside className={clsx("fold-menu", props.className, {"expand": expand})}>
        <IconButton className="button-menu" onClick={() => toggleExpand()} icon={icon} />
        {
            props.title
                ? <header className="title">{props.title}</header>
                : null
        }
        <div className={clsx("menu-content", {"expand": expand})}>
            {props.children}
        </div>
    </aside>)
}