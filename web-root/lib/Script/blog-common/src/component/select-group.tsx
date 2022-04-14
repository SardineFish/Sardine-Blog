import clsx from "clsx";
import React, { HTMLAttributes, ReactElement, ReactNode, useContext, useEffect, useState } from "react";

const SelectContext = React.createContext({ selected: false, onClick: (_: string) => undefined as any });

export interface SelectGroupProps extends React.DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>
{
    selectedKey?: string,
    onSelectChange?: (key: string) => void,
    children: ReactElement<{ id: string }>[] | ReactElement<{ id: string }>,
}

export function SelectGroup(props: SelectGroupProps)
{
    const [selected, setSelected] = useState<string | undefined>(props.selectedKey);

    const select = (key: string) =>
    {
        setSelected(key);
        if (key !== selected)
            props.onSelectChange?.(key);
    };

    const { selectedKey, onSelectChange, children, ...ulProps } = props;

    return (<ul className="select-group" {...ulProps}>
        {React.Children.map(props.children, (child, idx) => (<SelectContext.Provider
            key={idx}
            value={{
                selected: child.props.id as string === selected,
                onClick: () => select(child.props.id as string)
            }}
        >
            {child}
        </SelectContext.Provider>))}
    </ul>)
}

SelectGroup.Item = SelectItem;

function SelectItem(props: { id: string, onSelected?: (key: string) => void, children: ReactNode })
{
    const context = useContext(SelectContext);
    useEffect(() =>
    {
        if (context.selected)
            props.onSelected?.(props.id);
    }, [context.selected]);

    return (<li
        className={clsx("select-item", { "selected": context.selected })}
        onClick={() => context.onClick(props.id)}
    >
        {props.children}
    </li>)
}