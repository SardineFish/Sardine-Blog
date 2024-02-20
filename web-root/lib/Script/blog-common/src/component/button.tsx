import clsx from 'clsx';
import React, { useState, useEffect, MouseEvent } from 'react';

interface ButtonProps
{
    className?: string,
    type?: "normal" | "link",
    href?: string,
    onClick?: (e: MouseEvent<HTMLSpanElement>) => void,
    children?: React.ReactNode,
}

export function Button(props: ButtonProps)
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
    });

    if (props.type === "link")
    {
        return (
            <a className={clsx("button", state, props.className)} href={props.href} onClick={onClick} onMouseEnter={mouseIn} onMouseLeave={mouseOut} onMouseDown={mouseDown}>
                {props.children}
            </a>
        );
    }

    return (
        <span className={clsx("button", state, props.className)} onClick={onClick} onMouseEnter={mouseIn} onMouseLeave={mouseOut} onMouseDown={mouseDown}>
            {props.children}
        </span>
    )
}

export function IconButton(props: { icon: React.ReactNode } & ButtonProps)
{
    const { icon, className, ...buttonProps } = props;
    return (<Button className={clsx("icon-button", props.className)} {...buttonProps}>
        {props.icon}
        {
            props.children
                ? <span className="content">{props.children}</span>
                : null
        }
    </Button>)
}