import { match, IconButton, Icons, FoldMenu } from "blog-common";
import React, { MutableRefObject, RefObject, useEffect, useRef, useState } from "react";
import { DocType } from "sardinefish/SardineFish.API";
import { DocTypeSelector } from "./doc-type-editor";
import { MarkdownEditor, MarkdownEditorRef } from "./md-editor";
import { TagEditor } from "./tag-editor";
import { TextFieldEditor } from "./text-field";
import { TitleEditor } from "./title-editor";
import clsx from "clsx";

type EditorHeaderFieldTypeDescriptor = "title" | "text" | "tag";
interface EditorHeaderFieldDetailedDescriptor<T extends EditorHeaderFieldTypeDescriptor = EditorHeaderFieldTypeDescriptor>
{
    type: T,
    placeholder?: string,
    style?: React.CSSProperties,
    className?: string,
}
type EditorHeaderFieldDescriptor = EditorHeaderFieldDetailedDescriptor | EditorHeaderFieldTypeDescriptor;

type EditorHeaderFieldType<T extends EditorHeaderFieldDescriptor> =
    T extends EditorHeaderFieldTypeDescriptor ?
    {
        "title": string,
        "text": string,
        "tag": string[]
    }[T]
    : T extends EditorHeaderFieldDetailedDescriptor
    ? EditorHeaderFieldType<T["type"]> : never;

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
    [key in keyof T]: EditorHeaderFieldType<T[key]["type"]>
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
    getValue(): EditorHeaderFieldType<T>,
    clear(): void,
    setValue(value: EditorHeaderFieldType<T>): void,
}

export interface FieldEditorProps<T extends EditorHeaderFieldTypeDescriptor>
{
    name: string,
    descriptor: EditorHeaderFieldDetailedDescriptor<T>,
    onChanged?: (value: EditorHeaderFieldType<T>) => void,
    handle?: RefObject<FieldEditorRef<T>>;
}

export interface DocEditorProps<T extends EditorHeaderDescriptor>
{
    headers: T,
    initialDoc?: Doc<T>,
    onSend: (doc: Doc<T>) => void;
    onDelete: () => void;
}

export function DocEditor<Headers extends EditorHeaderDescriptor>(props: DocEditorProps<Headers>)
{
    const [docType, setDocType] = useState(DocType.Markdown);
    const docRef = useRef<MarkdownEditorRef>();
    const send = () =>
    {
        const headerValues: EditorHeaderType<Headers> = {} as any;

        for (const key of headers)
        {
            if (!refs[key].current)
            {
                console.warn("ref uninitialized");
                return;
            }

            headerValues[key] = refs[key].current?.getValue() as EditorHeaderFieldType<Headers[typeof key]["type"]>;
        }

        if (!docRef.current)
        {
            console.warn("ref uninitialized");
            return;
        }

        const content = docRef.current.getDoc();
        const doc: Doc<Headers> = {
            headers: headerValues,
            docType,
            content,
        }
        props.onSend(doc);
    }
    useEffect(() =>
    {
        if (props.initialDoc)
        {
            for (const key in props.initialDoc.headers)
            {
                refs[key].current?.setValue(props.initialDoc.headers[key]);
            }
            docRef.current?.setDoc(props.initialDoc.content);
        }
    }, [props.initialDoc]);
    const clear = () =>
    {
        for (const key in refs)
        {
            refs[key].current?.clear();
        }
        docRef.current?.clear();
    }

    const headers: (keyof Headers & string)[] = Object.keys(props.headers) as (keyof Headers & string)[];
    const refs: EditorHeaderRef<Headers> = {} as any;
    for (const key of headers)
    {
        refs[key] = useRef<FieldEditorRef<Headers[typeof key]["type"]>>(null);
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
            })))}
        </header>
        <div className="action-panel">
            <DocTypeSelector docType={docType} onChanged={setDocType} />
            <div className="post-actions">
                <FoldActionPanel delete={props.onDelete} clear={clear}/>
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

function FoldActionPanel(props: { delete: () => void, clear: ()=>void })
{
    return (<FoldMenu className="fold-actions" icon={<Icons.DotsVertical/>}>
        <IconButton onClick={props.delete} icon={<Icons.DeleteForever />} />
        <IconButton onClick={props.clear} icon={<Icons.TextBoxRemoveOutline/>}/>
    </FoldMenu>)
}