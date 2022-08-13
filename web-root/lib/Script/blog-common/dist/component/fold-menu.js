import React from "react";
import clsx from "clsx";
import { Icons, useToggle } from "../misc";
import { IconButton } from "./button";
export function FoldMenu(props) {
    const icon = props.icon ?? React.createElement(Icons.Menu, null);
    const [expand, toggleExpand] = useToggle(false);
    return (React.createElement("aside", { className: clsx("fold-menu", props.className, { "expand": expand }) },
        React.createElement(IconButton, { className: "button-menu", onClick: () => toggleExpand(), icon: icon }),
        props.title
            ? React.createElement("header", { className: "title" }, props.title)
            : null,
        React.createElement("div", { className: clsx("menu-content", { "expand": expand }) }, props.children)));
}
//# sourceMappingURL=fold-menu.js.map