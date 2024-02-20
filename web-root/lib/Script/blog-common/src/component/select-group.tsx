import clsx from "clsx";
import React, { HTMLAttributes, ReactElement, ReactNode, useContext, useEffect, useState } from "react";

const SelectContext = React.createContext({ selected: false, onClick: (_: string) => undefined as any });

type SelectionKey = string | number;

export interface SelectGroupProps<T> extends React.DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>
{
    selectedKey?: T,
    onSelectChange?: (key: T) => void,
    children: ReactElement<{ id: T }>[] | ReactElement<{ id: T }>,
}

export function SelectGroup<T extends SelectionKey = string>(props: SelectGroupProps<T>)
{
    const [selected, setSelected] = useState<T | undefined>(props.selectedKey);

    const select = (key: T) =>
    {
        setSelected(key);
        if (key !== selected)
            props.onSelectChange?.(key);
    };

    const { selectedKey, onSelectChange, children, ...ulProps } = props;

    useEffect(() =>
    {
        if (props.selectedKey !== undefined)
            select(props.selectedKey);
    }, [props.selectedKey]);

    return (<ul className="select-group" {...ulProps}>
        {React.Children.map(props.children, (child, idx) => (<SelectContext.Provider
            key={idx}
            value={{
                selected: child.props.id as T === selected,
                onClick: () => select(child.props.id as T)
            }}
        >
            {child}
        </SelectContext.Provider>))}
    </ul>)
}

SelectGroup.Item = SelectItem;

function SelectItem<T extends SelectionKey>(props: { id: T, onSelected?: (key: T) => void, children: ReactNode })
{
    const context = useContext(SelectContext);
    useEffect(() =>
    {
        if (context.selected)
            props.onSelected?.(props.id);
    }, [context.selected]);

    return (<li
        className={clsx("select-item", { "selected": context.selected })}
        onClick={() => context.onClick(props.id as string)}
    >
        {props.children}
    </li>)
}