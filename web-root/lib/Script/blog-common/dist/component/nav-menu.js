import clsx from "clsx";
import React from "react";
import { useToggle } from "../misc/use-toggle";
import { FoldMenu } from "./fold-menu";
import { SelectGroup } from "./select-group";
export function NavMenu(props) {
    const [expand, toggleExpand] = useToggle(false);
    return (React.createElement(FoldMenu, { className: clsx("nav-menu", props.className), title: props.title }, props.children
        ? props.children
        : React.createElement(BlogNav, null)));
}
export function BlogNav() {
    return (React.createElement(SelectGroup, { className: "nav-list" },
        React.createElement(SelectGroup.Item, { id: "home" },
            React.createElement("a", { href: "/" }, "HOME")),
        React.createElement(SelectGroup.Item, { id: "blog" },
            React.createElement("a", { href: "/blog/" }, "BLOG")),
        React.createElement(SelectGroup.Item, { id: "gallery" },
            React.createElement("a", { href: "/gallery/" }, "GALLERY")),
        React.createElement(SelectGroup.Item, { id: "note" },
            React.createElement("a", { href: "/note/" }, "NOTES")),
        React.createElement(SelectGroup.Item, { id: "lab" },
            React.createElement("a", { href: "https://lab.sardinefish.com/" }, "LAB")),
        React.createElement(SelectGroup.Item, { id: "github" },
            React.createElement("a", { href: "https://github.com/SardineFish" }, "GITHUB")),
        React.createElement(SelectGroup.Item, { id: "cook" },
            React.createElement("a", { href: "/cook/" }, "COOK")),
        React.createElement(SelectGroup.Item, { id: "about" },
            React.createElement("a", { href: "/about/" }, "ABOUT"))));
}
//# sourceMappingURL=nav-menu.js.map