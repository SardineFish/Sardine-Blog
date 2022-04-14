import React from "react";
import clsx from "clsx";
import { Icons, useToggle } from "../misc";

export function FoldMenu(props: {className: string, children: JSX.Element | null })
{
    const [expand, toggleExpand] = useToggle(false);
    return (<aside className={clsx("nav-menu", props.className)}>
        <Icons.Menu className="button-menu" onClick={() => toggleExpand()} />
        <div className={clsx("menu-content", {"expand": expand})}>
            {props.children}
        </div>
    </aside>)
}