import React, { MutableRefObject } from "react";
export interface MarkdownEditorRef {
    getDoc(): string;
    setDoc(doc: string): void;
    clear(): void;
}
export declare function MarkdownEditor(props: {
    handle?: MutableRefObject<MarkdownEditorRef | undefined>;
}): React.JSX.Element;
//# sourceMappingURL=md-editor.d.ts.map