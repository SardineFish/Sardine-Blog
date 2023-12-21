import React from "react";
export type FieldType = "number" | "string" | "location";
type FieldValue<T extends FieldType> = T extends "number" ? number : T extends "string" ? string : T extends "location" ? [number, number] : never;
export type DataValue<T extends DataPrototype> = {
    [key in keyof T]: FieldValue<T[key]>;
};
export interface DataPrototype {
    [key: string]: FieldType;
}
export declare function DataPrototype<T extends DataPrototype>(prototype: T): T;
interface FormProps<T extends DataPrototype> {
    prototype: T;
    readOnly?: true;
    onChanged?: (data: DataValue<T>) => void;
    onFieldChanged?: <Key extends keyof T>(name: Key, value: FieldValue<T[Key]>) => void;
    value?: DataValue<T>;
}
export declare function Form<T extends DataPrototype>(props: FormProps<T>): React.JSX.Element;
export {};
//# sourceMappingURL=form.d.ts.map