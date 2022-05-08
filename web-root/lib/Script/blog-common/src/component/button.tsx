import clsx from 'clsx';
import React, { useState, useEffect, MouseEvent } from 'react';

export function Button(props: { className?: string, onClick?: (e: MouseEvent<HTMLSpanElement>) => void, children?: React.ReactNode })
{
    const [hover, setHover] = useState(false);
    const [hold, setHold] = useState(false);
    const [state, setState] = useState("normal" as "normal" | "click" | "hover");
    const onClick = (e: MouseEvent<HTMLSpanElement>) =>
    {
        props.onClick?.(e);
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
        <span className={clsx("button", state, props.className)} onClick={onClick} onMouseEnter={mouseIn} onMouseLeave={mouseOut} onMouseDown={mouseDown}>
            {props.children}
        </span>
    )
}

export function IconButton(props: { className?: string, onClick?: () => void, icon: React.ReactNode })
{
    return (<Button className={clsx("icon-button", props.className)} onClick={props.onClick}>
        {props.icon}
    </Button>)
}