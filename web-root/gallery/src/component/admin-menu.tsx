import { IconButton, Icons } from "blog-common";
import React from "react";

export function TopIconMenu()
{
    return <div className="menu-admin">
        <IconButton className="button-rss-feed" type="link" href="/gallery/feed" icon={<Icons.RssFeed />}>RSS Feed</IconButton>
        <a href={`/account/login?redirect=${encodeURIComponent(window.location.toString())}`}>
            <IconButton icon={<Icons.Account />}>Login</IconButton>
        </a>
        <a href="/gallery/editor.html">
            <IconButton icon={<Icons.Upload />}>Upload</IconButton>
        </a>
    </div>
}