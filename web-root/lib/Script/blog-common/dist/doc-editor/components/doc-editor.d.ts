import React, { RefObject } from "react";
import { DocType } from "sardinefish";
declare type EditorHeaderFieldTypeDescriptor = "title" | "text" | "tag";
interface EditorHeaderFieldDetailedDescriptor<T extends EditorHeaderFieldTypeDescriptor = EditorHeaderFieldTypeDescriptor> {
    type: T;
    placeholder?: string;
    style?: React.CSSProperties;
    className?: string;
}
declare type EditorHeaderFieldDescriptor = EditorHeaderFieldDetailedDescriptor | EditorHeaderFieldTypeDescriptor;
declare type EditorHeaderFieldType<T extends EditorHeaderFieldDescriptor> = T extends EditorHeaderFieldTypeDescriptor ? {
    "title": string;
    "text": string;
    "tag": string[];
}[T] : T extends EditorHeaderFieldDetailedDescriptor ? EditorHeaderFieldType<T["type"]> : never;
declare type IntoDetailedDescriptor<T extends EditorHeaderFieldDescriptor> = T extends EditorHeaderFieldTypeDescriptor ? {
    type: T;
} : T extends EditorHeaderFieldDetailedDescriptor ? T : never;
interface EditorHeaderDescriptor {
    [key: string]: EditorHeaderFieldDetailedDescriptor;
}
export declare function EditorHeaderDescriptor<T extends {
    [key: string]: EditorHeaderFieldDescriptor;
}>(headers: T): {
    [key in keyof T]: IntoDetailedDescriptor<T[key]>;
};
declare type EditorHeaderType<T extends EditorHeaderDescriptor> = {
    [key in keyof T]: EditorHeaderFieldType<T[key]["type"]>;
};
export interface Doc<T extends EditorHeaderDescriptor> {
    headers: EditorHeaderType<T>;
    docType: DocType;
    content: string;
}
export interface FieldEditorRef<T extends EditorHeaderFieldTypeDescriptor> {
    getValue(): EditorHeaderFieldType<T>;
    clear(): void;
    setValue(value: EditorHeaderFieldType<T>): void;
}
export interface FieldEditorProps<T extends EditorHeaderFieldTypeDescriptor> {
    name: string;
    descriptor: EditorHeaderFieldDetailedDescriptor<T>;
    onChanged?: (value: EditorHeaderFieldType<T>) => void;
    handle?: RefObject<FieldEditorRef<T>>;
}
export interface DocEditorProps<T extends EditorHeaderDescriptor> {
    headers: T;
    autoSaveInterval?: number;
    /** Key to identify an auto-saved post saving such as the unique identity for editing document*/
    autoSaveKey?: string | number;
    initialDoc?: Doc<T>;
    onSend: (doc: Doc<T>) => Promise<boolean>;
    onDelete: () => Promise<void>;
}
export declare function DocEditor<Headers extends EditorHeaderDescriptor>(props: DocEditorProps<Headers>): JSX.Element;
interface FieldEditorWrapperProps<T extends EditorHeaderFieldTypeDescriptor> extends React.HTMLProps<HTMLDivElement> {
    descriptor: EditorHeaderFieldDetailedDescriptor<T>;
    name: string;
}
export declare function FieldEditorWrapper<T extends EditorHeaderFieldTypeDescriptor>(props: FieldEditorWrapperProps<T>): JSX.Element;
export {};
//# sourceMappingURL=doc-editor.d.ts.map