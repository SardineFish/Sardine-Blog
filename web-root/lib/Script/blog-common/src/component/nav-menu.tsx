import clsx from "clsx";
import React, { useState } from "react";
import { Icons } from "../misc/icons";
import { useToggle } from "../misc/use-toggle";
import { FoldMenu } from "./fold-menu";
import { SelectGroup } from "./select-group";

export function NavMenu(props: {className: string, title?: string})
{
    const [expand, toggleExpand] = useToggle(false);
    return (
        <FoldMenu className={clsx("nav-menu", props.className)} title={props.title}>
            <BlogNav/>
        </FoldMenu>
    );
}

export function BlogNav()
{
    return (<SelectGroup className="nav-list">
        <SelectGroup.Item id="home"><a href="/">HOME</a></SelectGroup.Item>
        <SelectGroup.Item id="blog"><a href="/blog/">BLOG</a></SelectGroup.Item>
        <SelectGroup.Item id="note"><a href="/note/">NOTES</a></SelectGroup.Item>
        <SelectGroup.Item id="lab"><a href="https://lab.sardinefish.com/">LAB</a></SelectGroup.Item>
        <SelectGroup.Item id="github"><a href="https://github.com/SardineFish">GITHUB</a></SelectGroup.Item>
        <SelectGroup.Item id="about"><a href="/about/">ABOUT</a></SelectGroup.Item>
    </SelectGroup>);
}