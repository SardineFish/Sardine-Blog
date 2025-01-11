import "./base.html";
import "../style/editor.scss";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { BlogNav, Footer, NavMenu, TabPage, Tabs, parseQueryString } from "blog-common";
import { TopIconMenu } from "../component/admin-menu";
import { ExhibitEditor } from "../component/exhibit-editor";

function App()
{
    const [editPid, setEditPid] = useState<number>(parseQueryString(window.location.search).pid as number);
    console.log("editing", editPid);

    return (<>
        <NavMenu className="top-nav" title="SardineFish Gallery">
            <BlogNav />
            <TopIconMenu />
        </NavMenu>
        <main className="page-content">
            <Tabs>
                <TabPage id="upload" title="Upload">
                    <ExhibitEditor pid={editPid} />
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