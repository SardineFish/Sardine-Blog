import React, { useEffect, useRef, useState } from "react";
import { DocType } from "sardinefish";
import { DocTypeSelector } from "./doc-type-editor";
import { MarkdownEditor } from "./md-editor";
import { TagEditor } from "./tag-editor";
import { TextFieldEditor } from "./text-field";
import { TitleEditor } from "./title-editor";
import clsx from "clsx";
import { dialog, message, IconButton, FoldMenu } from "../../component";
import { Icons, match } from "../../misc";
import { ImageEditor } from "./img-editor";
export function EditorHeaderDescriptor(headers) {
    const result = {};
    for (const key in headers) {
        switch (typeof headers[key]) {
            case "string":
                result[key] = {
                    type: headers[key],
                };
                break;
            case "object":
                result[key] = headers[key];
                break;
        }
    }
    return result;
}
const DOC_SAVE_KEY = "doc-editor-saved_";
export function DocEditor(props) {
    const headers = Object.keys(props.headers);
    const refs = {};
    for (const key of headers) {
        refs[key] = useRef(null);
    }
    const [docType, setDocType] = useState(DocType.Markdown);
    const docRef = useRef();
    const save_key = `${DOC_SAVE_KEY}-${props.autoSaveKey ?? "NEW"}`;
    const getDoc = () => {
        const headerValues = {};
        for (const key of headers) {
            if (!refs[key].current)
                throw new Error("ref uninitialized");
            headerValues[key] = refs[key].current?.getValue();
        }
        if (!docRef.current)
            throw new Error("ref uninitialized");
        const content = docRef.current.getDoc();
        const doc = {
            headers: headerValues,
            docType,
            content,
        };
        return doc;
    };
    const send = async () => {
        const doc = getDoc();
        const success = await props.onSend(doc);
        // Clear saved doc if we successfully post to server
        if (success) {
            window.localStorage.removeItem(save_key);
        }
    };
    const saveDoc = () => {
        const doc = getDoc();
        window.localStorage.setItem(save_key, JSON.stringify(doc));
        console.log("Doc saved");
    };
    const loadDoc = (doc) => {
        for (const key in doc.headers) {
            refs[key].current?.setValue(doc.headers[key]);
        }
        docRef.current?.setDoc(doc.content);
    };
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (props.initialDoc) {
                loadDoc(props.initialDoc);
            }
            else {
                const docJson = window.localStorage.getItem(save_key);
                if (docJson) {
                    loadDoc(JSON.parse(docJson));
                    console.log("load saved doc");
                }
            }
        }, 100);
        return () => clearTimeout(timeout);
    }, [props.initialDoc]);
    useEffect(() => {
        let handle = 0;
        if (props.autoSaveInterval !== undefined) {
            handle = window.setInterval(() => {
                saveDoc();
            }, props.autoSaveInterval * 1000);
        }
        return () => clearInterval(handle);
    });
    const onClear = async () => {
        if (await dialog.confirm("All content will be clear?")) {
            for (const key in refs) {
                refs[key].current?.clear();
            }
            docRef.current?.clear();
            message.success("All content clear");
        }
    };
    const onDelete = () => {
        dialog.confirm("Confirm to delete this post forever?", {
            className: "dialog-delete-post",
            icon: React.createElement(Icons.DeleteForever, null),
            buttons: {
                ok: {
                    content: "Delete",
                    click: async () => {
                        await props.onDelete();
                        return true;
                    }
                },
            }
        });
    };
    if (props.handle) {
        props.handle.current = {
            save: saveDoc
        };
    }
    return (React.createElement("div", { className: "doc-editor" },
        React.createElement("header", { className: "headers" }, headers.map((key, idx) => (match(props.headers[key].type, {
            "tag": (React.createElement(TagEditor, { name: key, key: idx, handle: refs[key], descriptor: props.headers[key] })),
            "text": (React.createElement(TextFieldEditor, { name: key, key: idx, handle: refs[key], descriptor: props.headers[key] })),
            "title": (React.createElement(TitleEditor, { name: key, key: idx, handle: refs[key], descriptor: props.headers[key] })),
            "img": (React.createElement(ImageEditor, { name: key, key: idx, handle: refs[key], descriptor: props.headers[key] }))
        })))),
        React.createElement("div", { className: "action-panel" },
            React.createElement(DocTypeSelector, { docType: docType, onChanged: setDocType }),
            React.createElement("div", { className: "post-actions" },
                React.createElement(FoldActionPanel, { delete: onDelete, clear: onClear }),
                React.createElement(IconButton, { className: "button-send", icon: React.createElement(Icons.Send, null), onClick: send }))),
        React.createElement("div", { className: "content-editor" },
            React.createElement(MarkdownEditor, { handle: docRef }))));
}
export function FieldEditorWrapper(props) {
    const { className, children, ...others } = props;
    return (React.createElement("div", { className: clsx("field-editor", className, props.descriptor.className, `field-${props.name}`), ...others }, children));
}
function FoldActionPanel(props) {
    return (React.createElement(FoldMenu, { className: "fold-actions", icon: React.createElement(Icons.DotsVertical, null) },
        React.createElement(IconButton, { onClick: props.delete, icon: React.createElement(Icons.DeleteForever, null) }),
        React.createElement(IconButton, { onClick: props.clear, icon: React.createElement(Icons.TextBoxRemoveOutline, null) })));
}
//# sourceMappingURL=doc-editor.js.map