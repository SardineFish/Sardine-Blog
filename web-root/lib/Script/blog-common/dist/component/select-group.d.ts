import React, { HTMLAttributes, ReactElement, ReactNode } from "react";
type SelectionKey = string | number;
export interface SelectGroupProps<T> extends React.DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement> {
    selectedKey?: T;
    onSelectChange?: (key: T) => void;
    children: ReactElement<{
        id: T;
    }>[] | ReactElement<{
        id: T;
    }>;
}
export declare function SelectGroup<T extends SelectionKey = string>(props: SelectGroupProps<T>): React.JSX.Element;
export declare namespace SelectGroup {
    var Item: typeof SelectItem;
}
declare function SelectItem<T extends SelectionKey>(props: {
    id: T;
    onSelected?: (key: T) => void;
    children: ReactNode;
}): React.JSX.Element;
export {};
//# sourceMappingURL=select-group.d.ts.map