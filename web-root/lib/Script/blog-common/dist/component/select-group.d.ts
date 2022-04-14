import React, { HTMLAttributes, ReactElement, ReactNode } from "react";
export interface SelectGroupProps extends React.DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement> {
    selectedKey?: string;
    onSelectChange?: (key: string) => void;
    children: ReactElement<{
        id: string;
    }>[] | ReactElement<{
        id: string;
    }>;
}
export declare function SelectGroup(props: SelectGroupProps): JSX.Element;
export declare namespace SelectGroup {
    var Item: typeof SelectItem;
}
declare function SelectItem(props: {
    id: string;
    onSelected?: (key: string) => void;
    children: ReactNode;
}): JSX.Element;
export {};
//# sourceMappingURL=select-group.d.ts.map