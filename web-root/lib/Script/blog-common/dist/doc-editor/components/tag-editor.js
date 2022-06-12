import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "../../component";
import { Icons } from "../../misc";
import { FieldEditorWrapper } from "./doc-editor";
export function TagEditor(props) {
    const [tags, setTags] = useState([""]);
    const tagChanged = (tag, idx) => {
        tags[idx] = tag;
        setTags([...tags]);
    };
    const addTag = () => {
        if (tags[tags.length - 1] !== "")
            setTags([...tags, ""]);
    };
    const removeTag = (idx) => {
        tags.splice(idx, 1);
        setTags([...tags]);
    };
    if (props.handle) {
        props.handle.current = {
            getValue: () => tags.filter(tag => tag !== ""),
            clear: () => setTags([""]),
            setValue: (tags) => setTags(tags),
        };
    }
    return (React.createElement(FieldEditorWrapper, { className: "tag-editor", name: props.name, descriptor: props.descriptor },
        React.createElement("ul", { className: "tags-container" }, tags.map((tag, idx) => (React.createElement(EditableTag, { text: tag, key: idx, onChange: text => tagChanged(text, idx), onRemove: () => removeTag(idx) })))),
        React.createElement(IconButton, { className: "button-add", icon: React.createElement(Icons.Plus, null), onClick: addTag }),
        React.createElement("header", { className: "placeholder label" }, props.descriptor.placeholder)));
}
function EditableTag(props) {
    const onInput = (e) => {
        props.onChange?.(e.currentTarget.innerText);
    };
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current)
            return;
        if (ref.current.innerText !== props.text)
            ref.current.innerText = props.text;
    }, [props.text]);
    useEffect(() => {
        ref.current?.focus();
    }, []);
    return (React.createElement("li", { className: "editable-tag tag" },
        React.createElement("span", { contentEditable: true, onInput: onInput, "data-placeholder": "Tag", ref: ref }),
        React.createElement(IconButton, { className: "button-remove", onClick: props.onRemove, icon: React.createElement(Icons.Close, null) })));
}
//# sourceMappingURL=tag-editor.js.map