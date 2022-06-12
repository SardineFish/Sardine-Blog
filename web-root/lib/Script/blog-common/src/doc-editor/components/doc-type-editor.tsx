import React, { useState } from "react";
import { DocType } from "sardinefish";
import { SelectGroup } from "../../component";

export function DocTypeSelector(props: { docType: DocType, onChanged?: (type: DocType) => void })
{
    const [docType, setDocType] = useState(props.docType);

    const change = (key: DocType) =>
    {
        setDocType(key);
        props.onChanged?.(key);
    };
    return (<div className="doc-type-selector">
        <header className="label">DocType</header>
        <SelectGroup selectedKey={docType} onSelectChange={change}>
            <SelectGroup.Item id={DocType.PlainText}>PlainText</SelectGroup.Item>
            <SelectGroup.Item id={DocType.Markdown}>Markdown</SelectGroup.Item>
            <SelectGroup.Item id={DocType.HTML}>HTML</SelectGroup.Item>
        </SelectGroup>
    </div>);
}