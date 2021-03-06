import { useState } from "react";

export function useHistory(callback?: ()=>void): [Location, (url: string, title?: string) => void ]
{
    const [urlState, setUrlState] = useState(window.location);
    const [_handler, _] = useState(() =>
    {
        const onPopState = () =>
        {
            setUrlState(window.location);
            callback?.();
        };
        window.addEventListener("popstate", onPopState);
        console.log("useHistory");
        return onPopState;
    });

    return [urlState, (url, title?) =>
    {
        window.history.pushState(url, title || document.title, url);
        callback?.();
    }];
}