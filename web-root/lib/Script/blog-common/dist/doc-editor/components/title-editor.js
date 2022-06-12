import React, { useState } from "react";
import { FieldEditorWrapper } from "./doc-editor";
export function TitleEditor(props) {
    const [text, setText] = useState("");
    if (props.handle) {
        props.handle.current = {
            getValue: () => text,
            setValue: (value) => setText(value),
            clear: () => setText("")
        };
    }
    return (React.createElement(FieldEditorWrapper, { className: "title-editor", name: props.name, descriptor: props.descriptor },
        React.createElement("input", { type: "text", value: text, onChange: e => setText(e.target.value), placeholder: props.descriptor.placeholder })));
}
//# sourceMappingURL=title-editor.js.map