import React, { useState } from "react";
import { FieldEditorWrapper } from "./doc-editor";
export function TextFieldEditor(props) {
    const [text, setText] = useState("");
    if (props.handle) {
        props.handle.current = {
            getValue: () => text,
            setValue: (value) => setText(value),
            clear: () => setText("")
        };
    }
    return (React.createElement(FieldEditorWrapper, { className: "text-editor", name: props.name, descriptor: props.descriptor },
        React.createElement("input", { type: "text", value: text, placeholder: props.descriptor.placeholder, onChange: e => setText(e.target.value) })));
}
//# sourceMappingURL=text-field.js.map