
import React, { FormEvent, FormEventHandler, MutableRefObject, useEffect, useRef, useState } from "react";
import { IconButton } from "../../component";
import { Icons } from "../../misc";
import { FieldEditorProps, FieldEditorRef, FieldEditorWrapper } from "./doc-editor";

export function TagEditor(props: FieldEditorProps<"tag">)
{
    const [tags, setTags] = useState([""] as string[]);
    const tagChanged = (tag: string, idx: number) =>
    {
        tags[idx] = tag;
        setTags([...tags]);
    }

    const addTag = () =>
    {
        if (tags[tags.length - 1] !== "")
            setTags([...tags, ""]);
    }
    const removeTag = (idx: number) =>
    {
        tags.splice(idx, 1);
        setTags([...tags]);
    }

    if (props.handle)
    {
        (props.handle as MutableRefObject<FieldEditorRef<"tag">>).current = {
            getValue: () => tags.filter(tag => tag !== ""),
            clear: () => setTags([""]),
            setValue: (tags)=>setTags(tags),
        };
    }

    return (<FieldEditorWrapper className="tag-editor" name={props.name} descriptor={props.descriptor}>
        <ul className="tags-container">
            {
                tags.map((tag, idx) => (<EditableTag
                    text={tag}
                    key={idx}
                    onChange={text => tagChanged(text, idx)}
                    onRemove={() => removeTag(idx)}
                />))
            }
        </ul>
        <IconButton className="button-add" icon={<Icons.Plus />} onClick={addTag} />
        <header className="placeholder label">
            {props.descriptor.placeholder}
        </header>
    </FieldEditorWrapper>);
}

function EditableTag(props: { text: string, onChange: (text: string) => void, onRemove:() =>void })
{
    const onInput = (e: FormEvent<HTMLDivElement>) =>
    {
        props.onChange?.(e.currentTarget.innerText);
    }
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() =>
    {
        if (!ref.current)
            return;
        if (ref.current.innerText !== props.text)
            ref.current.innerText = props.text;
    }, [props.text]);
    useEffect(() =>
    {
        ref.current?.focus();
    }, []);
    return (<li className="editable-tag tag">
        <span contentEditable onInput={onInput} data-placeholder="Tag" ref={ref} ></span>
        <IconButton className="button-remove" onClick={props.onRemove} icon={<Icons.Close/>}/>
    </li>);
}