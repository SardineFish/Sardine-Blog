import { ReactNode } from "react";
export interface DialogButton<T = void> {
    content: ReactNode;
    click: (() => T) | (() => Promise<T>);
    type?: "normal" | "primary" | "disabled";
}
type ButtonConfigs<T> = {
    [key: number]: DialogButton<T>;
} | {
    [key: string]: DialogButton<T>;
};
export interface DialogOptions<T = void> {
    title?: string;
    content: string;
    icon?: ReactNode;
    buttons: ButtonConfigs<T>;
    className?: string;
    onCancel?: () => T;
}
type DialogOptionsOverride<T, K extends string | number> = Partial<{
    title?: string;
    content: string;
    icon?: ReactNode;
    buttons: Partial<{
        [key in K]: Partial<DialogButton<T>>;
    }>;
    className?: string;
    onCancel?: () => T;
}>;
export declare const dialog: {
    confirm(msg: string, override?: DialogOptionsOverride<boolean, "ok" | "cancel">): Promise<boolean>;
    info(msg: string, override?: DialogOptionsOverride<void, "ok">): Promise<void>;
    show<T>(optios: DialogOptions<T>): Promise<T>;
};
export declare function mergeOption<T, U>(a: T, b: U): T & U;
export {};
//# sourceMappingURL=dialog.d.ts.map