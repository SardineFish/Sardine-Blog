import React from "react";
import clsx from "clsx";
import { Icons, useToggle } from "../misc";
import { IconButton } from "./button";

export function FoldMenu(props: { className: string, children?: React.ReactNode, icon?: JSX.Element})
{
    const icon = props.icon ?? <Icons.Menu/>
    const [expand, toggleExpand] = useToggle(false);
    return (<aside className={clsx("fold-menu", props.className)}>
        <IconButton className="button-menu" onClick={() => toggleExpand()} icon={icon}/>
        <div className={clsx("menu-content", {"expand": expand})}>
            {props.children}
        </div>
    </aside>)
}