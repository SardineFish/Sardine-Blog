import React, { useEffect, useRef, useState } from "react";
import SimpleMDE from "simplemde";
import { marked } from "marked";
import { SelectGroup } from "../../component";
import { error } from "../../misc";
window.marked = marked;
var EditMode;
(function (EditMode) {
    EditMode["Preview"] = "preview";
    EditMode["Code"] = "code";
    EditMode["Markdown"] = "markdown";
})(EditMode || (EditMode = {}));
window.react1 = React;
export function MarkdownEditor(props) {
    let ref = useRef(null);
    const [editMode, setEditMode] = useState(EditMode.Preview);
    const [editor, setEditor] = useState(null);
    useEffect(() => {
        if (!ref.current)
            return;
        if (!editor) {
            const editor = new SimpleMDE({
                element: ref.current,
                initialValue: "",
                toolbar: false,
                spellChecker: false,
            });
            setTimeout(() => {
                editor.toggleSideBySide();
            }, 100);
            setEditor(editor);
        }
    }, []);
    if (props.handle) {
        props.handle.current = {
            getDoc: () => {
                return editor?.value() ?? error("uninitialized ref");
            },
            clear: () => editor?.value(""),
            setDoc: (value) => editor?.value(value),
        };
    }
    return (React.createElement("div", { className: "md-editor" },
        React.createElement("header", { className: "tool-bar" },
            React.createElement(SelectGroup, { className: "select-edit-mode", selectedKey: editMode, onSelectChange: setEditMode },
                React.createElement(SelectGroup.Item, { id: EditMode.Code }, "Code"),
                React.createElement(SelectGroup.Item, { id: EditMode.Preview }, "Preview"),
                React.createElement(SelectGroup.Item, { id: EditMode.Markdown }, "Markdown"))),
        React.createElement("main", { className: "md-input markdown-body" },
            React.createElement("textarea", { ref: ref }))));
}
//# sourceMappingURL=md-editor.js.map