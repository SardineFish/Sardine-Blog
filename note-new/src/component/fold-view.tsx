import React, { useState, useEffect } from "react";
import classnames from "classnames";

export function FoldView(props: { extend: boolean, className?: string, children?: React.ReactNode, extendHeight?:number, extendTime?:number })
{
    const [height, setHeight] = useState(props.extend ? null : 0);
    const extendHeight = props.extendHeight || window.innerHeight;
    const extendTime = props.extendTime || 1;
    useEffect(() =>
    {
        if (height !== null && props.extend)
        {
            setHeight(extendHeight);
            setTimeout(() => setHeight(null), extendTime * 1000);
        }
        else if (height && !props.extend)
        {
            setHeight(0);
        }
        else if (!props.extend)
        {
            setHeight(extendHeight);
            setHeight(0);
        }
    });
    return (
        <div className={classnames("fold-view", { "extend": props.extend }, props.className)} style={{ maxHeight: height === null ? "unset" : height }}>
            {props.children}
        </div>
    );
}