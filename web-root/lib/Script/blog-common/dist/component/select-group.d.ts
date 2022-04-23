import React, { HTMLAttributes, ReactElement, ReactNode } from "react";
export interface SelectGroupProps<T> extends React.DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement> {
    selectedKey?: T;
    onSelectChange?: (key: T) => void;
    children: ReactElement<{
        id: T;
    }>[] | ReactElement<{
        id: T;
    }>;
}
export declare function SelectGroup<T extends string = string>(props: SelectGroupProps<T>): JSX.Element;
export declare namespace SelectGroup {
    var Item: typeof SelectItem;
}
declare function SelectItem<T extends string>(props: {
    id: T;
    onSelected?: (key: T) => void;
    children: ReactNode;
}): JSX.Element;
export {};
//# sourceMappingURL=select-group.d.ts.map