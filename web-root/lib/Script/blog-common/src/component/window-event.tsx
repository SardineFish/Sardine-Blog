import React, { useEffect } from "react";

export function WindowEvent<K extends keyof WindowEventMap>(props: { event: K, listener: (ev: WindowEventMap[K]) => any })
{
    useEffect(() =>
    {
        window.addEventListener(props.event, props.listener);
        return () => window.removeEventListener(props.event, props.listener);
    }, [props.event, props.listener]);
    return (<></>);
}