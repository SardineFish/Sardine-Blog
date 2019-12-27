import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames";

export function FixedOnScroll(props: {className?:string, children: React.ReactNode})
{
    const [fixed, setFixed] = useState(false);
    const refAnchor = useRef(null as HTMLDivElement | null);
    const onScroll = () =>
    {
        if (!refAnchor.current)
            return;
        const rect = refAnchor.current.getBoundingClientRect();
        if (rect.top < 0)
            setFixed(true);
        else
            setFixed(false);
    };
    useEffect(() =>
    {
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    });
    return (
        <div className={classNames("fixed-on-scroll", props.className, { "fixed": fixed })}>
            <div ref={refAnchor} className="anchor"></div>
            <div className="content">
                {props.children}
            </div>
        </div>
    );
}