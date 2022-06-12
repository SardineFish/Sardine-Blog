import React, { MutableRefObject, useState } from "react";
import { FieldEditorProps, FieldEditorRef, FieldEditorWrapper } from "./doc-editor";

export function TitleEditor(props: FieldEditorProps<"title">)
{
    const [text, setText] = useState("");

    if (props.handle)
    {
        (props.handle as MutableRefObject<FieldEditorRef<"title">>).current = {
            getValue: () => text,
            setValue: (value) => setText(value),
            clear: () => setText("")
        };
    }

    return (<FieldEditorWrapper className="title-editor" name={props.name} descriptor={props.descriptor}>
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder={props.descriptor.placeholder} />
    </FieldEditorWrapper>);
}