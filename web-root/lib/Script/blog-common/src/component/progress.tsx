import clsx from "clsx";
import React from "react";

export function Progress(props: { className?: string, fraction: number })
{
    return (<div className={clsx("progress-bar", props.className)}>
        <div className="progress" style={{ width: `${props.fraction * 100}%` }}></div>
    </div>)
}