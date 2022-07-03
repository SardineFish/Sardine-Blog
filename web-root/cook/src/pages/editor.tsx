import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { buildQueryString, error, Footer, message, NavMenu, parseQueryString } from "blog-common";
import "../style/editor.scss";
// import { Doc, DocEditor, EditorHeaderDescriptor } from "../components/doc-editor";
import { Doc, EditorHeaderDescriptor, DocEditor } from "blog-common";
import { API, DocType, APIError } from "sardinefish";
import "./base.html";

(window as any).react2 = React;

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
        try
        {
            const body = {
                title: doc.headers.title,
                description: doc.headers.description,
                requirements: doc.headers.requirements,
                optional: doc.headers.optional,
                content: doc.content
            };
            if (editPid)
            {
                await API.Cook.update({ pid: editPid }, body);
                message.success("Successfully updated");
            }
            else
            {
                const pid = await API.Cook.post({}, body);
                message.success(`Cook created as pid ${pid}`);
                setTimeout(() =>
                {
                    let queryString = parseQueryString<{pid: number}>(window.location.search);
                    queryString.pid = pid;
                    window.location.search = buildQueryString(queryString);
                    // setEditPid(pid);
                }, 1000);
            }
            return true;
        }
        catch (err)
        {
            message.error(`0x${(err as APIError).code.toString(16)}: ${(err as APIError).message}`);
            return false;
        }
    };
    const deleteDoc = async () =>
    {
        if (editPid)
        {
            try
            {
                await SardineFish.API.Cook.delete({ pid: editPid });
                message.success("Successfully deleted");
                setTimeout(() =>
                {
                    window.location.assign("/cook/");
                }, 1000);
            }
            catch (err)
            {
                message.error(`Failed to delete :${(err as APIError).message}`);
            }
        }
    }

    useEffect(() =>
    {
        (async () =>
        {
            if (editPid)
            {
                const data = await API.Cook.get({ pid: editPid as number });
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
            <DocEditor headers={headerDescriptor} onSend={send} initialDoc={iniialDoc} onDelete={deleteDoc} autoSaveInterval={10} autoSaveKey={editPid}/>
        </main>
        <Footer />
    </>);
}

const root = createRoot(document.querySelector("#root") ?? document.body);
root.render(<App />);