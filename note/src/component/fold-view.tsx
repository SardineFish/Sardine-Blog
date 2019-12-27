import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";


export function FoldView(props: { extend: boolean, className?: string, children?: React.ReactNode, time?: number })
{
    const [height, setHeight] = useState(0 as number | "unset");
    const [fullHeight, setFullHeight] = useState(0);
    const time = props.time || .3;
    const ref = useRef(null as HTMLDivElement | null);
    useEffect(() =>
    {
        if (!ref.current)
            return;
        const scrollHeight = ref.current.scrollHeight;
        if (scrollHeight != fullHeight)
        {
            setFullHeight(scrollHeight);
            return;
        }
        if (props.extend)
        {
            if (height !== "unset")
            {
                setHeight(scrollHeight);
                setTimeout(() =>
                {
                    setHeight("unset");
                }, time * 1000);
            }
        }
        else if(height === "unset")
        {
            setHeight(scrollHeight);
            return;
        }
        else
        {
            setHeight(0);    
        }
    });

    return (
        <div ref={ref} className={classnames("fold-view", { "extend": props.extend }, props.className)} style={{ maxHeight: height }}>
            {props.children}
        </div>
    );
}