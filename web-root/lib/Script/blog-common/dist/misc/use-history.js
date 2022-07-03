import { useState } from "react";
export function useHistory(callback) {
    const [urlState, setUrlState] = useState(window.location);
    const [_handler, _] = useState(() => {
        const onPopState = () => {
            const location = {
                ...window.location
            };
            setUrlState(location);
            callback?.();
        };
        window.addEventListener("popstate", onPopState);
        console.log("useHistory");
        return onPopState;
    });
    return [urlState, (url, title) => {
            window.history.pushState(url, title || document.title, url);
            callback?.();
        }];
}
//# sourceMappingURL=use-history.js.map