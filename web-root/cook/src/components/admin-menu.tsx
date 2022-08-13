import { IconButton, Icons } from "blog-common";
import React from "react";

export function AdminMenu()
{
    return <div className="menu-admin">
        <a href={`/account/login?redirect=${encodeURIComponent(window.location.toString())}`}>
            <IconButton icon={<Icons.Account />}>Login</IconButton>
        </a>
        <a href="/cook/editor.html">
            <IconButton icon={<Icons.Pencil />}>New Recipe</IconButton>
        </a>
    </div>
}