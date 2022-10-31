import React, { useEffect } from "react";
export function WindowEvent(props) {
    useEffect(() => {
        window.addEventListener(props.event, props.listener);
        return () => window.removeEventListener(props.event, props.listener);
    }, [props.event, props.listener]);
    return (React.createElement(React.Fragment, null));
}
export function DocumentEvent(props) {
    useEffect(() => {
        document.addEventListener(props.event, props.listener);
        return () => document.removeEventListener(props.event, props.listener);
    }, [props.event, props.listener]);
    return (React.createElement(React.Fragment, null));
}
//# sourceMappingURL=window-event.js.map