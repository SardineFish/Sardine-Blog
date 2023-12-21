import React from "react";
export declare function WindowEvent<K extends keyof WindowEventMap>(props: {
    event: K;
    listener: (ev: WindowEventMap[K]) => any;
}): React.JSX.Element;
export declare function DocumentEvent<K extends keyof DocumentEventMap>(props: {
    event: K;
    listener: (ev: DocumentEventMap[K]) => any;
}): React.JSX.Element;
//# sourceMappingURL=window-event.d.ts.map