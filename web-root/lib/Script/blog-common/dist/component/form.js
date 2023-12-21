import clsx from "clsx";
import React, { useEffect, useState } from "react";
export function DataPrototype(prototype) {
    return prototype;
}
export function Form(props) {
    const defaultValue = {
        number: 0,
        string: "",
        location: [0, 0]
    };
    const initData = () => {
        const initialData = {};
        for (const name in props.prototype) {
            initialData[name] = (props.value?.[name] || defaultValue[props.prototype[name]]);
        }
        return initialData;
    };
    const [data, setData] = useState(initData);
    useEffect(() => {
        setData(initData());
    }, [props.prototype]);
    useEffect(() => {
        if (props.value) {
            console.log("set data", props.value);
            setData(props.value);
        }
    }, [props.value]);
    const onFieldChanged = (name, value) => {
        data[name] = value;
        props.onFieldChanged?.(name, value);
        props.onChanged?.(data);
    };
    return (React.createElement("form", { className: "form" }, Object.keys(props.prototype).map((name, idx) => (props.readOnly
        ? React.createElement(ReadonlyField, { name: name, type: props.prototype[name], value: data[name], key: idx, readonly: props.readOnly })
        : React.createElement(FieldEditor, { name: name, type: props.prototype[name], value: data[name], key: idx, onChanged: onFieldChanged, readonly: props.readOnly })))));
}
function ReadonlyField(props) {
    const renderField = () => {
        switch (props.type) {
            case "number":
            case "string":
                return (React.createElement("div", { className: clsx("field-value") }, props.value));
            case "location":
                const [x, y] = props.value;
                return (React.createElement("div", { className: clsx("field-value", "field-value-loc") },
                    React.createElement("span", { className: "field-value-loc-x" }, x),
                    React.createElement("span", { className: "seperator" }, ","),
                    React.createElement("span", { className: "field-value-loc-y" }, y)));
        }
    };
    return (React.createElement("div", { className: clsx("form-field", `form-field-${props.name}`) },
        React.createElement("header", { className: "field-name" }, props.name),
        renderField()));
}
function FieldEditor(props) {
    console.log("rerender field editor");
    const [value, setValue] = useState(props.value);
    useEffect(() => {
        setValue(props.value);
    }, [props.name, props.type, props.value]);
    const onChanged = (changedValue) => {
        if (changedValue !== value) {
            setValue(changedValue);
            props.onChanged?.(props.name, changedValue);
        }
    };
    const fieldEditor = () => {
        switch (props.type) {
            case "number":
                const numValue = value;
                return (React.createElement("input", { className: clsx("field-editor", "field-value", "field-value-number", "field-editor-number"), type: "number", value: numValue, onChange: e => onChanged(e.target.valueAsNumber), readOnly: props.readonly }));
            case "string":
                const strValue = value;
                return (React.createElement("input", { className: clsx("field-editor", "field-value", "field-value-string", "field-editor-string"), type: "string", value: strValue, onChange: e => onChanged(e.target.value), readOnly: props.readonly }));
            case "location":
                const locValue = value;
                return (React.createElement("div", { className: clsx("field-editor", "field-value", "field-value-loc", "field-editor-loc") },
                    React.createElement("input", { className: "field-editor-loc-x field-value-loc-x", type: "number", value: locValue[0], onChange: e => onChanged([e.target.valueAsNumber, locValue[1]]), readOnly: props.readonly }),
                    React.createElement("span", { className: "seperator" }, ","),
                    React.createElement("input", { className: "field-editor-loc-x field-value-loc-x", type: "number", value: locValue[1], onChange: e => onChanged([locValue[0], e.target.valueAsNumber]), readOnly: props.readonly })));
        }
    };
    return (React.createElement("div", { className: clsx("form-field", `form-field-${props.name}`) },
        React.createElement("header", { className: "field-name" }, props.name),
        fieldEditor()));
}
//# sourceMappingURL=form.js.map