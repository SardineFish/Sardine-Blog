import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";


export function FoldView(props: { extend: boolean, className?: string, children?: React.ReactNode, time?: number })
{
    const [state, setState] = useState({
        extend: props.extend,
        height: props.extend ? null : 0 as number
    });
    const time = props.time || .3;
    const ref = useRef(null as HTMLDivElement | null);
    useEffect(() =>
    {
        if (!ref.current)
            return;
        const scrollHeight = ref.current.scrollHeight;

        setState({
            extend: props.extend,
            height: props.extend ? scrollHeight : null
        });
        const id = setTimeout(() => {
            setState({
                extend: props.extend,
                height: null
            });
        }, time * 1000);

        return () => clearTimeout(id);
    }, [props.extend]);

    return (
        <div
            ref={ref}
            className={classnames("fold-view", { "extend": state.extend }, { "fold": !state.extend }, props.className)}
            style={state.height === null ? {} : { maxHeight: state.height }}>
            {props.children}
        </div>
    );
}