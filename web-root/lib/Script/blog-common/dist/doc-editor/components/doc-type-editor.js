import React, { useState } from "react";
import { DocType } from "sardinefish";
import { SelectGroup } from "../../component";
export function DocTypeSelector(props) {
    const [docType, setDocType] = useState(props.docType);
    const change = (key) => {
        setDocType(key);
        props.onChanged?.(key);
    };
    return (React.createElement("div", { className: "doc-type-selector" },
        React.createElement("header", { className: "label" }, "DocType"),
        React.createElement(SelectGroup, { selectedKey: docType, onSelectChange: change },
            React.createElement(SelectGroup.Item, { id: DocType.PlainText }, "PlainText"),
            React.createElement(SelectGroup.Item, { id: DocType.Markdown }, "Markdown"),
            React.createElement(SelectGroup.Item, { id: DocType.HTML }, "HTML"))));
}
//# sourceMappingURL=doc-type-editor.js.map