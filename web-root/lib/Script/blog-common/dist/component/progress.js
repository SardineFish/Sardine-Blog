import clsx from "clsx";
import React from "react";
export function Progress(props) {
    return (React.createElement("div", { className: clsx("progress-bar", props.className) },
        React.createElement("div", { className: "progress", style: { width: `${props.fraction * 100}%` } })));
}
//# sourceMappingURL=progress.js.map