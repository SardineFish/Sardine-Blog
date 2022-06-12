import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import SimpleMDE from "simplemde";
import { marked } from "marked";
import { SelectGroup } from "../../component";
import { error } from "../../misc";

(window as any).marked = marked;

export interface MarkdownEditorRef {
    getDoc(): string,
    setDoc(doc: string): void,
    clear(): void,
}

enum EditMode
{
    Preview="preview",
    Code="code",
    Markdown="markdown",
}

(window as any).react1 = React;

export function MarkdownEditor(props: {handle?: MutableRefObject<MarkdownEditorRef|undefined>})
{
    let ref = useRef<HTMLTextAreaElement>(null);
    const [editMode, setEditMode] = useState(EditMode.Preview);
    const [editor, setEditor] = useState<SimpleMDE | null>(null);

    useEffect(() =>
    {
        if (!ref.current)
            return;
        
        if (!editor)
        {
            const editor = new SimpleMDE({
                element: ref.current,
                initialValue: "",
                toolbar: false,
                spellChecker: false,
            });
            setTimeout(() =>
            {
                editor.toggleSideBySide();

            }, 100);
            setEditor(editor);
        }
    }, []);

    if (props.handle)
    {
        props.handle.current= {
            getDoc: () =>
            {
                return editor?.value() ?? error("uninitialized ref");
            },
            clear: () => editor?.value(""),
            setDoc: (value) => editor?.value(value),
        }
    }

    return (<div className="md-editor">
        <header className="tool-bar">
            <SelectGroup className="select-edit-mode" selectedKey={editMode} onSelectChange={setEditMode}>
                <SelectGroup.Item id={EditMode.Code}>Code</SelectGroup.Item>
                <SelectGroup.Item id={EditMode.Preview}>Preview</SelectGroup.Item>
                <SelectGroup.Item id={EditMode.Markdown}>Markdown</SelectGroup.Item>
            </SelectGroup>
        </header>
        <main className="md-input">
            <textarea ref={ref}></textarea>
        </main>
    </div>)
}
