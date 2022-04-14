"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHistory = void 0;
const react_1 = require("react");
function useHistory(callback) {
    const [urlState, setUrlState] = (0, react_1.useState)(window.location);
    const [_handler, _] = (0, react_1.useState)(() => {
        const onPopState = () => {
            setUrlState(window.location);
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
exports.useHistory = useHistory;
//# sourceMappingURL=use-history.js.map