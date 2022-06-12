import React, { MutableRefObject, useState } from "react";
import { FieldEditorProps, FieldEditorRef, FieldEditorWrapper } from "./doc-editor";

export function TextFieldEditor(props: FieldEditorProps<"text">)
{
    const [text, setText] = useState("");
    
    if (props.handle)
    {
        (props.handle as MutableRefObject<FieldEditorRef<"text">>).current = {
            getValue: () => text,
            setValue: (value) => setText(value),
            clear: ()=> setText("")
        };
    }

    return (<FieldEditorWrapper className="text-editor" name={props.name} descriptor={props.descriptor}>
        <input type="text" value={text} placeholder={props.descriptor.placeholder} onChange={e => setText(e.target.value)} />
    </FieldEditorWrapper>);
}