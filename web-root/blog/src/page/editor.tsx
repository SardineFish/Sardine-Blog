import { NavMenu, BlogNav, DocEditor, EditorHeaderDescriptor, BlogNavigation, Doc, parseQueryString, DocEditorRef, catch_and_log, message, dialog } from "blog-common";
import React, { useEffect, useRef, useState } from "react";
import {createRoot} from "react-dom/client";
import { API, APIError } from "sardinefish";

const headerDescriptor = EditorHeaderDescriptor({
    "title": {
        type: "title",
        placeholder: "Title",
    },
    "tags": {
        type: "tag",
        placeholder: "Tags",
    }
})


function App()
{
    const [iniialDoc, setInitialDoc] = useState<Doc<typeof headerDescriptor>>();
    const [editPid, setEditPid] = useState<number | undefined>(parseEditPid());
    const editoRef = useRef<DocEditorRef>(null);

    const send = async (doc: Doc<typeof headerDescriptor>) =>
    {
        try
        {
            let pid: number;
            if (editPid)
                pid = await API.Blog.update({ pid: editPid }, {
                    doc: doc.content,
                    doc_type: doc.docType,
                    tags: doc.headers.tags,
                    title: doc.headers.title
                });
            else
                pid = await API.Blog.post({}, {
                    doc: doc.content,
                    doc_type: doc.docType,
                    tags: doc.headers.tags,
                    title: doc.headers.title
                });
            

            setTimeout(() =>
            {
                window.location.assign(`/blog/${pid}`)
            }, 1000);
            message.success(`Post as pid ${pid}, redirecting...`);

            return true;
            
        }
        catch (e: any)
        {
            const err = e as APIError;
            message.error(`${err.code}: ${err.message}`);
            if (err.code === 0x0003_0400)
                setTimeout(() => {
                    window.location.assign(BlogNavigation.login(window.location.toString()));
                }, 1000);
            return false;
        }
    };

    const deleteDoc = async () =>
    {
        if (!editPid)
            return;
        
        await catch_and_log(async () =>
        {
            await API.Blog.delete({ pid: editPid });

            message.success(`Blog with pid ${editPid} deleted.`);
            setTimeout(() => {
                window.location.assign("/blog/");
            }, 1000);
        });
    }

    useEffect(() =>
    {
        if (!editPid)
            return;
        
        catch_and_log(async () =>
        {
            const blog = await API.Blog.getByPid({ pid: editPid });
            setInitialDoc({
                docType: blog.doc_type,
                content: blog.doc,
                headers: {
                    title: blog.title,
                    tags: blog.tags,
                }
            });
        });
    }, [editPid]);

    return (<>
        <NavMenu className="top-nav" >
            <BlogNav />
        </NavMenu>
        <main className="page-content">
            <DocEditor
                headers={headerDescriptor}
                initialDoc={iniialDoc}
                autoSaveInterval={5}
                autoSaveKey={editPid}
                handle={editoRef}
                onSend={send}
                onDelete={deleteDoc}
            />
        </main>
    </>
    );
}

function parseEditPid() {
    const queryPid = parseQueryString(window.location.search).pid as number | undefined;
    const pathPid = parseInt(window.location.pathname.split("/").pop() || "");
    return queryPid || pathPid || undefined;
}

const root = createRoot(document.querySelector("#root") ?? document.body);
root.render(<App />);
