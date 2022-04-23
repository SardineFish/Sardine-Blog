import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./base.html";
import { Footer, NavMenu, parseQueryString } from "blog-common";
import "../style/editor.scss";
import SimpleMDE from "simplemde";
import { MarkdownEditor } from "../components/md-editor";
import { Doc, DocEditor, EditorHeaderDescriptor } from "../components/doc-editor";
import SardineFishAPI, { DocType } from "sardinefish/SardineFish.API";

function App()
{
    const headerDescriptor = EditorHeaderDescriptor({
        title: {
            type: "title",
            placeholder: "Title",
        },
        description: {
            type: "text",
            placeholder: "Description",
        },
        requirements: {
            type: "tag",
            placeholder: "Requirements",
        },
        optional: {
            type: "tag",
            placeholder: "Optional",
        },
    });

    const [iniialDoc, setInitialDoc] = useState<Doc<typeof headerDescriptor>>();
    const [editPid, setEditPid] = useState<number>(parseQueryString(window.location.search).pid as number);

    const send = async (doc: Doc<typeof headerDescriptor>) =>
    {
        const body = {
            title: doc.headers.title,
            description: doc.headers.description,
            requirements: doc.headers.requirements,
            optional: doc.headers.optional,
            content: doc.content
        };
        if (editPid)
            await SardineFishAPI.Cook.update({ pid: editPid }, body);
        else
        {
            const pid = await SardineFishAPI.Cook.post({}, body);
            setEditPid(pid);
        }
    };
    const deleteDoc = async () =>
    {
        if (editPid)
        {
            
        }
    }

    useEffect(() =>
    {
        (async () =>
        {
            if (editPid)
            {
                const data = await SardineFishAPI.Cook.get({ pid: editPid as number });
                setInitialDoc({
                    headers: {
                        title: data.content.title,
                        description: data.content.description,
                        requirements: data.content.requirements,
                        optional: data.content.optional,
                    },
                    docType: DocType.Markdown,
                    content: data.content.content,
                });
            }
        })();
    }, [editPid]);

    return (<>
        <NavMenu className="top-nav" />
        <main className="page-content">
            <DocEditor headers={headerDescriptor} onSend={send} initialDoc={iniialDoc} onDelete={deleteDoc}/>
        </main>
        <Footer />
    </>);
}

const root = createRoot(document.body);
root.render(<App />);