
import React, { MutableRefObject, RefObject, useEffect, useRef, useState } from "react";
import { DocType } from "sardinefish";
import { DocTypeSelector } from "./doc-type-editor";
import { MarkdownEditor, MarkdownEditorRef } from "./md-editor";
import { TagEditor } from "./tag-editor";
import { TextFieldEditor } from "./text-field";
import { TitleEditor } from "./title-editor";
import clsx from "clsx";
import { dialog, message, IconButton, FoldMenu } from "../../component";
import { Icons, match } from "../../misc";
import { ImageEditor } from "./img-editor";

interface EditorHeaderTypes
{
    "title": string,
    "text": string,
    "tag": string[],
    "img": string,
}

type EditorHeaderFieldTypeDescriptor = keyof EditorHeaderTypes;
interface EditorHeaderFieldDetailedDescriptor<T extends EditorHeaderFieldTypeDescriptor = EditorHeaderFieldTypeDescriptor>
{
    type: T,
    placeholder?: string,
    style?: React.CSSProperties,
    className?: string,
}
type EditorHeaderFieldDescriptor = EditorHeaderFieldDetailedDescriptor | EditorHeaderFieldTypeDescriptor;

type EditorHeaderFieldValueType<T extends EditorHeaderFieldDescriptor> =
    T extends EditorHeaderFieldTypeDescriptor ?
    EditorHeaderTypes[T]
    : T extends EditorHeaderFieldDetailedDescriptor
    ? EditorHeaderFieldValueType<T["type"]> : never;

type IntoDetailedDescriptor<T extends EditorHeaderFieldDescriptor> =
    T extends EditorHeaderFieldTypeDescriptor
    ? {
        type: T,
    } : T extends EditorHeaderFieldDetailedDescriptor
    ? T : never;

interface EditorHeaderDescriptor
{
    [key: string]: EditorHeaderFieldDetailedDescriptor;
}

export function EditorHeaderDescriptor<T extends { [key: string]: EditorHeaderFieldDescriptor }>(headers: T):
    {
        [key in keyof T]: IntoDetailedDescriptor<T[key]>;
    }
{
    const result: {
        [key in keyof T]: IntoDetailedDescriptor<T[key]>;
    } = {} as any;
    for (const key in headers)
    {
        switch (typeof headers[key])
        {
            case "string":
                result[key] = {
                    type: headers[key],
                } as IntoDetailedDescriptor<T[typeof key]>;
                break;
            case "object":
                result[key] = headers[key] as IntoDetailedDescriptor<T[typeof key]>;
                break;
        }
    }

    return result;
}

type EditorHeaderType<T extends EditorHeaderDescriptor> = {
    [key in keyof T]: EditorHeaderFieldValueType<T[key]["type"]>
};

type EditorHeaderRef<T extends EditorHeaderDescriptor> = {
    [key in keyof T]: RefObject<FieldEditorRef<T[key]["type"]>>;
};

export interface Doc<T extends EditorHeaderDescriptor>
{
    headers: EditorHeaderType<T>,
    docType: DocType,
    content: string,
}

export interface FieldEditorRef<T extends EditorHeaderFieldTypeDescriptor>
{
    getValue(): EditorHeaderFieldValueType<T>,
    clear(): void,
    setValue(value: EditorHeaderFieldValueType<T>): void,
}

export interface FieldEditorProps<T extends EditorHeaderFieldTypeDescriptor>
{
    name: string,
    descriptor: EditorHeaderFieldDetailedDescriptor<T>,
    onChanged?: (value: EditorHeaderFieldValueType<T>) => void,
    handle?: RefObject<FieldEditorRef<T>>;
}

export interface DocEditorProps<T extends EditorHeaderDescriptor>
{
    headers: T,
    autoSaveInterval?: number,
    /** Key to identify an auto-saved post saving such as the unique identity for editing document*/
    autoSaveKey?: string | number,
    initialDoc?: Doc<T>,
    handle?: RefObject<DocEditorRef>,
    onSend: (doc: Doc<T>) => Promise<boolean>;
    onDelete: () => Promise<void>;
}

export interface DocEditorRef
{
    save: () => void;
}

const DOC_SAVE_KEY = "doc-editor-saved_";

export function DocEditor<Headers extends EditorHeaderDescriptor>(props: DocEditorProps<Headers>)
{
    const headers: (keyof Headers & string)[] = Object.keys(props.headers) as (keyof Headers & string)[];
    const refs: EditorHeaderRef<Headers> = {} as any;
    for (const key of headers)
    {
        refs[key] = useRef<FieldEditorRef<Headers[typeof key]["type"]>>(null);
    }


    const [docType, setDocType] = useState(DocType.Markdown);
    const docRef = useRef<MarkdownEditorRef>();
    const save_key = `${DOC_SAVE_KEY}-${props.autoSaveKey ?? "NEW"}`;
    const getDoc = () =>
    {
        const headerValues: EditorHeaderType<Headers> = {} as any;

        for (const key of headers)
        {
            if (!refs[key].current)
                throw new Error("ref uninitialized");

            headerValues[key] = refs[key].current?.getValue() as EditorHeaderFieldValueType<Headers[typeof key]["type"]>;
        }

        if (!docRef.current)
            throw new Error("ref uninitialized");

        const content = docRef.current.getDoc();
        const doc: Doc<Headers> = {
            headers: headerValues,
            docType,
            content,
        }
        return doc;
    }
    const send = async () =>
    {
        const doc = getDoc();
        const success = await props.onSend(doc);

        // Clear saved doc if we successfully post to server
        if (success)
        {
            window.localStorage.removeItem(save_key);
        }
    }
    const saveDoc = () =>
    {
        const doc = getDoc();
        window.localStorage.setItem(save_key, JSON.stringify(doc));
        console.log("Doc saved");
    }
    const loadDoc = (doc: Doc<Headers>) =>
    {
        for (const key in doc.headers)
        {
            refs[key].current?.setValue(doc.headers[key]);
        }
        docRef.current?.setDoc(doc.content);
    }
    useEffect(() =>
    {
        const timeout = setTimeout(() =>
        {
            if (props.initialDoc)
            {
                loadDoc(props.initialDoc);
            }
            else
            {
                const docJson = window.localStorage.getItem(save_key);
                if (docJson)
                {
                    loadDoc(JSON.parse(docJson));
                    console.log("load saved doc");
                }
            }
        }, 100);
        return () => clearTimeout(timeout);
    }, [props.initialDoc]);
    useEffect(() =>
    {
        let handle: number = 0;
        if (props.autoSaveInterval !== undefined)
        {
            handle = window.setInterval(() =>
            {
                saveDoc();
            }, props.autoSaveInterval * 1000);
        }

        return () => clearInterval(handle);
    });
    const onClear = async () =>
    {
        if (await dialog.confirm("All content will be clear?"))
        {
            for (const key in refs)
            {
                refs[key].current?.clear();
            }
            docRef.current?.clear();
            message.success("All content clear");
        }
    };
    const onDelete = () =>
    {
        dialog.confirm("Confirm to delete this post forever?", {
            className: "dialog-delete-post",
            icon: <Icons.DeleteForever />,
            buttons: {
                ok: {
                    content: "Delete",
                    click: async () =>
                    {
                        await props.onDelete();
                        return true;
                    }
                },
            }
        });
    };

    if (props.handle)
    {
        (props.handle as MutableRefObject<DocEditorRef>).current = {
            save: saveDoc
        };
    }

    return (<div className="doc-editor" >
        <header className="headers">
            {headers.map((key, idx) => (match(props.headers[key].type, {
                "tag": (<TagEditor
                    name={key}
                    key={idx}
                    handle={refs[key] as RefObject<FieldEditorRef<"tag">>}
                    descriptor={props.headers[key] as EditorHeaderFieldDetailedDescriptor<"tag">}
                />),
                "text": (<TextFieldEditor
                    name={key}
                    key={idx}
                    handle={refs[key] as RefObject<FieldEditorRef<"text">>}
                    descriptor={props.headers[key] as EditorHeaderFieldDetailedDescriptor<"text">}
                />),
                "title": (<TitleEditor
                    name={key}
                    key={idx}
                    handle={refs[key] as RefObject<FieldEditorRef<"title">>}
                    descriptor={props.headers[key] as EditorHeaderFieldDetailedDescriptor<"title">}
                />),
                "img": (<ImageEditor
                    name={key}
                    key={idx}
                    handle={refs[key] as RefObject<FieldEditorRef<"img">>}
                    descriptor={props.headers[key] as EditorHeaderFieldDetailedDescriptor<"img">}
                />)
            })))}
        </header>
        <div className="action-panel">
            <DocTypeSelector docType={docType} onChanged={setDocType} />
            <div className="post-actions">
                <FoldActionPanel delete={onDelete} clear={onClear} />
                <IconButton className="button-send" icon={<Icons.Send />} onClick={send} />
            </div>
        </div>
        <div className="content-editor">
            <MarkdownEditor handle={docRef} />
        </div>
    </div>)
}

interface FieldEditorWrapperProps<T extends EditorHeaderFieldTypeDescriptor> extends React.HTMLProps<HTMLDivElement>
{
    descriptor: EditorHeaderFieldDetailedDescriptor<T>,
    name: string,
}

export function FieldEditorWrapper<T extends EditorHeaderFieldTypeDescriptor>(props: FieldEditorWrapperProps<T>)
{
    const { className, children, ...others } = props;
    return (<div className={clsx("field-editor", className, props.descriptor.className, `field-${props.name}`)} {...others}>
        {children}
    </div>)
}

function FoldActionPanel(props: { delete: () => void, clear: () => void })
{
    return (<FoldMenu className="fold-actions" icon={<Icons.DotsVertical />}>
        <IconButton onClick={props.delete} icon={<Icons.DeleteForever />} />
        <IconButton onClick={props.clear} icon={<Icons.TextBoxRemoveOutline />} />
    </FoldMenu>)
}