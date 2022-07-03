import { useState } from "react";

export function useHistory(callback?: () => void): [Location, (url: string, title?: string) => void ]
{
    const [_, update] = useState({});
    const [_handler] = useState(() =>
    {
        const onPopState = () =>
        {
            callback?.();
            update({});
        };
        window.addEventListener("popstate", onPopState);
        console.log("useHistory");
        return onPopState;
    });

    const location: Location = {
        ...window.location
    };

    return [location, (url, title?) =>
    {
        window.history.pushState(url, title || document.title, url);
        callback?.();
    }];
}