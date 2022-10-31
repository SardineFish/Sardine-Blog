/// <reference types="react" />
export declare function WindowEvent<K extends keyof WindowEventMap>(props: {
    event: K;
    listener: (ev: WindowEventMap[K]) => any;
}): JSX.Element;
export declare function DocumentEvent<K extends keyof DocumentEventMap>(props: {
    event: K;
    listener: (ev: DocumentEventMap[K]) => any;
}): JSX.Element;
//# sourceMappingURL=window-event.d.ts.map