import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { minIndexOf } from "../misc";
import { useArrayState } from "../misc/useArrayState";
export function Waterfall(props) {
    const [columnsHeight, setColumnsHeight, setColumnsHeightArr] = useArrayState([], props.columns, 0);
    const [columnsItemIndics, setColumnItemIndices, setColumnItemIndicesArr] = useArrayState([], props.columns, []);
    const [childrenColumnIndices, setChildrenColumnIndices] = useState([]);
    const [ready, setReady] = useState(true);
    const onHeightChanged = (idx, height) => {
        setColumnsHeight(idx, height);
        setReady(true);
    };
    const { className, children, ...otherProps } = props;
    let childrenArr = React.Children.toArray(children);
    childrenColumnIndices.length = React.Children.count(children);
    useEffect(() => {
        setColumnsHeightArr(new Array(props.columns).fill(0));
        setColumnItemIndicesArr(new Array(props.columns).fill([]));
        setChildrenColumnIndices(new Array(childrenColumnIndices.length).fill(undefined));
    }, [props.columns]);
    if (ready) {
        for (let index = 0; index < childrenColumnIndices.length; ++index) {
            if (childrenColumnIndices[index] === undefined) {
                var column = minIndexOf(columnsHeight, x => x);
                console.log("place", index, column);
                childrenColumnIndices[index] = column;
                setColumnItemIndices(column, [...columnsItemIndics[column], index]);
                setChildrenColumnIndices(childrenColumnIndices);
                setReady(false);
                break;
            }
        }
    }
    return (React.createElement("div", { className: clsx(className, "waterfall") }, columnsItemIndics.map((childrenIndices, idx) => (React.createElement(WaterfallColumn, { key: idx, onHeightChanged: height => onHeightChanged(idx, height) }, childrenIndices.map((childIdx, idx) => (React.createElement(WaterfallItem, { key: idx }, childrenArr[childIdx]))))))));
}
function WaterfallColumn(props) {
    const ref = useRef(null);
    const [height, setHeight] = useState(0);
    const { ref: _, className, onHeightChanged, ...otherProps } = props;
    useEffect(() => {
        if (!ref.current)
            return;
        let rect = ref.current.getBoundingClientRect();
        if (rect.height != height) {
            setHeight(rect.height);
            props.onHeightChanged(rect.height);
            console.log(rect.height, height);
        }
    });
    return (React.createElement("ul", { className: clsx(className, "waterfall-column"), ref: ref, ...otherProps }));
}
function WaterfallItem(props) {
    const { className, ...otherProps } = props;
    return (React.createElement("li", { className: clsx(className, "waterfall-item"), ...otherProps }));
}
//# sourceMappingURL=waterfall.js.map