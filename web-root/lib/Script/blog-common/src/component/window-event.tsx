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
export function DocumentEvent<K extends keyof DocumentEventMap>(props: { event: K, listener: (ev: DocumentEventMap[K]) => any })
{
    useEffect(() =>
    {
        document.addEventListener(props.event, props.listener);
        return () => document.removeEventListener(props.event, props.listener);
    }, [props.event, props.listener]);
    return (<></>);
}