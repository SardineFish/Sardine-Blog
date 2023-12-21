import { IconButton, Icons } from "blog-common";
import React from "react";

export function AdminMenu()
{
    return <div className="menu-admin">
        <a href={`/account/login?redirect=${encodeURIComponent(window.location.toString())}`}>
            <IconButton icon={<Icons.Account />}>Login</IconButton>
        </a>
        <a href="/gallery/editor.html">
            <IconButton icon={<Icons.Upload />}>Upload</IconButton>
        </a>
    </div>
}