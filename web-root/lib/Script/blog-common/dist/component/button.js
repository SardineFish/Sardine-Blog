import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
export function Button(props) {
    const [hover, setHover] = useState(false);
    const [hold, setHold] = useState(false);
    const [state, setState] = useState("normal");
    const onClick = (e) => {
        props.onClick?.(e);
    };
    const mouseDown = () => {
        setHold(true);
        setState("click");
    };
    const mouseUp = () => {
        setHold(false);
        setState(hover ? "hover" : "normal");
    };
    const mouseIn = () => {
        setHover(true);
        setState(hold ? "click" : "hover");
    };
    const mouseOut = () => {
        setHover(false);
        setState(hold ? "click" : "normal");
    };
    useEffect(() => {
        window.addEventListener("mouseup", mouseUp);
        return () => window.removeEventListener("mouseup", mouseUp);
    });
    return (React.createElement("span", { className: clsx("button", state, props.className), onClick: onClick, onMouseEnter: mouseIn, onMouseLeave: mouseOut, onMouseDown: mouseDown }, props.children));
}
export function IconButton(props) {
    return (React.createElement(Button, { className: clsx("icon-button", props.className), onClick: props.onClick }, props.icon));
}
//# sourceMappingURL=button.js.map