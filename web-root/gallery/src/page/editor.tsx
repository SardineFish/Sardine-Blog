import "./base.html";
import "../style/editor.scss";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { BlogNav, Footer, NavMenu, TabPage, Tabs } from "blog-common";
import { AdminMenu } from "../component/admin-menu";
import { ExhibitEditor } from "../component/exhibit-editor";

function App()
{
    return (<>
        <NavMenu className="top-nav" title="SardineFish Gallery">
            <BlogNav />
            <AdminMenu />
        </NavMenu>
        <main className="page-content">
            <Tabs>
                <TabPage id="upload" title="Upload">
                    <ExhibitEditor />
                </TabPage>
                <TabPage id="preview" title="Preview">
                </TabPage>
            </Tabs>
        </main>
        <Footer />
    </>);
}

const root = createRoot(document.querySelector("#root") ?? document.body);
root.render(<App />);

new EventSource('/gallery/esbuild').addEventListener('change', e =>
{
    const { added, removed, updated } = JSON.parse(e.data)

    if (!added.length && !removed.length && updated.length === 1)
    {
        for (const link of Array.from(document.getElementsByTagName("link")))
        {
            const url = new URL(link.href)

            if (url.host === location.host && url.pathname === updated[0])
            {
                const next = link.cloneNode() as HTMLLinkElement;
                next.href = updated[0] + '?' + Math.random().toString(36).slice(2)
                next.onload = () => link.remove()
                link.parentNode?.insertBefore(next, link.nextSibling)
                return
            }
        }
    }

    location.reload()
});