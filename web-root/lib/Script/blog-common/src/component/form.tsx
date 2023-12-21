import clsx from "clsx";
import React, { useEffect, useState } from "react";

export type FieldType = "number" | "string" | "location";

type FieldValue<T extends FieldType> =
    T extends "number" ? number
    : T extends "string" ? string
    : T extends "location" ? [number, number]
    : never;

export type DataValue<T extends DataPrototype> = {
    [key in keyof T]: FieldValue<T[key]>
}

export interface DataPrototype
{
    [key: string]: FieldType
}

export function DataPrototype<T extends DataPrototype>(prototype: T): T
{
    return prototype;
}

interface FormProps<T extends DataPrototype>
{
    prototype: T
    readOnly?: true
    onChanged?: (data: DataValue<T>) => void,
    onFieldChanged?: <Key extends keyof T>(name: Key, value: FieldValue<T[Key]>) => void,
    value?: DataValue<T>,
}

export function Form<T extends DataPrototype>(props: FormProps<T>)
{
    const defaultValue: Record<FieldType, FieldValue<FieldType>> = {
        number: 0,
        string: "",
        location: [0, 0]
    };

    const initData = () =>
    {
        const initialData: DataValue<T> = {} as any;


        for (const name in props.prototype)
        {
            initialData[name] = (props.value?.[name] || defaultValue[props.prototype[name]]) as any;
        }

        return initialData;
    };

    const [data, setData] = useState<DataValue<T>>(initData);

    useEffect(() =>
    {
        setData(initData());
    }, [props.prototype]);

    useEffect(() =>
    {
        if (props.value)
        {

            console.log("set data", props.value);
            setData(props.value);
        }
    }, [props.value]);

    const onFieldChanged = (name: string, value: FieldValue<FieldType>) =>
    {
        (data as Record<string, FieldValue<FieldType>>)[name] = value;

        props.onFieldChanged?.(name, value as any);
        props.onChanged?.(data);
    }

    return (
        <form className="form">
            {
                Object.keys(props.prototype).map((name, idx) => (
                    props.readOnly
                        ? <ReadonlyField
                            name={name}
                            type={props.prototype[name]}
                            value={data[name]}
                            key={idx}
                            readonly={props.readOnly}
                        />
                        : <FieldEditor
                            name={name}
                            type={props.prototype[name]}
                            value={data[name]}
                            key={idx}
                            onChanged={onFieldChanged}
                            readonly={props.readOnly}
                        />))
            }
        </form>
    )
}

interface FieldEditorProps<T extends FieldType>
{
    name: string,
    type: T,
    value: FieldValue<T>,
    readonly?: true,
    onChanged?: (name: string, value: FieldValue<T>) => void,
}

function ReadonlyField<T extends FieldType>(props: FieldEditorProps<T>)
{
    const renderField = () =>
    {
        switch (props.type)
        {
            case "number":
            case "string":
                return (<div className={clsx("field-value")}>{props.value}</div>)
            case "location":
                const [x, y] = props.value as [number, number]
                return (<div className={clsx("field-value", "field-value-loc")}>
                    <span className="field-value-loc-x">{x}</span>
                    <span className="seperator">,</span>
                    <span className="field-value-loc-y">{y}</span>
                </div>)
        }
    };
    return (
        <div className={clsx("form-field", `form-field-${props.name}`)}>
            <header className="field-name">{props.name}</header>
            {renderField()}
        </div>
    )
}

function FieldEditor<T extends FieldType>(props: FieldEditorProps<T>)
{
    console.log("rerender field editor");

    const [value, setValue] = useState(props.value);

    useEffect(() =>
    {
        setValue(props.value);

    }, [props.name, props.type, props.value]);

    const onChanged = (changedValue: FieldValue<T>) =>
    {
        if (changedValue !== value)
        {
            setValue(changedValue);
            props.onChanged?.(props.name, changedValue);
        }
    }

    const fieldEditor = () =>
    {
        switch (props.type)
        {
            case "number":
                const numValue = value as number;
                return (<input
                    className={clsx("field-editor", "field-value", "field-value-number", "field-editor-number")}
                    type="number"
                    value={numValue}
                    onChange={e => onChanged(e.target.valueAsNumber as FieldValue<T>)}
                    readOnly={props.readonly}
                ></input>);
            case "string":
                const strValue = value as string;
                return (<input
                    className={clsx("field-editor", "field-value", "field-value-string", "field-editor-string")}
                    type="string"
                    value={strValue}
                    onChange={e => onChanged(e.target.value as FieldValue<T>)}
                    readOnly={props.readonly}
                ></input>);
            case "location":
                const locValue = value as [number, number]
                return (<div className={clsx("field-editor", "field-value", "field-value-loc", "field-editor-loc")}>
                    <input
                        className="field-editor-loc-x field-value-loc-x"
                        type="number"
                        value={locValue[0]}
                        onChange={e => onChanged([e.target.valueAsNumber, locValue[1]] as any)}
                        readOnly={props.readonly}
                    ></input>
                    <span className="seperator">,</span>
                    <input
                        className="field-editor-loc-x field-value-loc-x"
                        type="number"
                        value={locValue[1]}
                        onChange={e => onChanged([locValue[0], e.target.valueAsNumber] as any)}
                        readOnly={props.readonly}
                    ></input>
                </div>)
        }
    };

    return (
        <div className={clsx("form-field", `form-field-${props.name}`)}>
            <header className="field-name">{props.name}</header>
            {fieldEditor()}
        </div>
    );
}