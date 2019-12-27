import React, { useState, useEffect } from 'react';
import classNames from "classnames";

export function Button(props: { className?: string, onClick?: () => void, children?:React.ReactNode })
{
    const [hover, setHover] = useState(false);
    const [hold, setHold] = useState(false);
    const [state, setState] = useState("normal" as "normal" | "click" | "hover");
    const onClick = () =>
    {
        props.onClick && props.onClick();
    };
    const mouseDown = () =>
    {
        setHold(true);
        setState("click");
    };
    const mouseUp = () =>
    {
        setHold(false);
        setState(hover ? "hover" : "normal");
    };
    const mouseIn = () =>
    {
        setHover(true);
        setState(hold ? "click" : "hover");
    };
    const mouseOut = () =>
    {
        setHover(false);
        setState(hold ? "click" : "normal");
    }
    useEffect(() =>
    {
        window.addEventListener("mouseup", mouseUp);
        return () => window.removeEventListener("mouseup", mouseUp);
    })
    return (
        <span className={classNames("button", state, props.className)} onClick={onClick} onMouseEnter={mouseIn} onMouseLeave={mouseOut} onMouseDown={mouseDown}>
            {props.children}
        </span>
    )
}