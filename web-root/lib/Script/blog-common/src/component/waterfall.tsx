import clsx from "clsx";
import React, { HTMLProps, ReactChild, useEffect, useRef, useState } from "react";
import { minIndexOf, useToggle } from "../misc";
import { useArrayState } from "../misc/useArrayState";

export interface WaterfallProps extends HTMLProps<HTMLDivElement>
{
    columns: number,
}

export function Waterfall(props: WaterfallProps)
{
    const [columnsHeight, setColumnsHeight, setColumnsHeightArr] = useArrayState<number>([], props.columns, 0);
    const [columnsItemIndics, setColumnItemIndices, setColumnItemIndicesArr] = useArrayState<number[]>([], props.columns, []);
    const [childrenColumnIndices, setChildrenColumnIndices] = useState<number[]>([]);
    const [ready, setReady] = useState(true);

    const onHeightChanged = (idx: number, height: number) => {
        setColumnsHeight(idx, height);
        setReady(true);
    };

    const { className, children, ...otherProps } = props;

    let childrenArr = React.Children.toArray(children);

    childrenColumnIndices.length = React.Children.count(children);

    useEffect(() =>
    {
        setColumnsHeightArr(new Array(props.columns).fill(0));
        setColumnItemIndicesArr(new Array(props.columns).fill([]));
        setChildrenColumnIndices(new Array(childrenColumnIndices.length).fill(undefined));
    }, [props.columns]);

    if (ready)
    {
        for (let index = 0; index < childrenColumnIndices.length; ++index)
        {
            if (childrenColumnIndices[index] === undefined)
            {
                var column = minIndexOf(columnsHeight, x => x);
                console.log("place", index, column)
                childrenColumnIndices[index] = column;
                setColumnItemIndices(column, [...columnsItemIndics[column], index]);
                setChildrenColumnIndices(childrenColumnIndices);
                setReady(false);
                break;
            }
        }
    }
    

    return (<div className={clsx(className, "waterfall")}>
        {columnsItemIndics.map((childrenIndices, idx) => (<WaterfallColumn key={idx} onHeightChanged={height => onHeightChanged(idx, height)}>
            {childrenIndices.map((childIdx, idx) => (<WaterfallItem key={idx}>{childrenArr[childIdx]}</WaterfallItem>))}
        </WaterfallColumn>))}
    </div>)
}

interface WaterfallColumnProps extends HTMLProps<HTMLUListElement>
{
    onHeightChanged: (height: number) => void,
}

function WaterfallColumn(props: WaterfallColumnProps)
{
    const ref = useRef<HTMLUListElement>(null);
    const [height, setHeight] = useState(0);

    const { ref: _, className, onHeightChanged, ...otherProps } = props;
    
    useEffect(() =>
    {
        if (!ref.current)
            return;
        let rect = ref.current.getBoundingClientRect();
        if (rect.height != height)
        {
            setHeight(rect.height);
            props.onHeightChanged(rect.height);
            console.log(rect.height, height);
        }

    });

    return (<ul className={clsx(className, "waterfall-column")} ref={ref} {...otherProps}></ul>);
}

function WaterfallItem(props: HTMLProps<HTMLLIElement>)
{
    const { className, ...otherProps } = props;
    return (<li className={clsx(className, "waterfall-item")} {...otherProps}>
    </li>);
}