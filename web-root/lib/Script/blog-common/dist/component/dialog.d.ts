import { ReactNode } from "react";
export interface DialogButton<T = void> {
    content: ReactNode;
    click: (() => T) | (() => Promise<T>);
    type?: "normal" | "primary" | "disabled";
}
declare type ButtonConfigs<T> = {
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
export declare const dialog: {
    confirm(msg: string, override?: Partial<{
        title?: string | undefined;
        content: string;
        icon?: ReactNode;
        buttons: Partial<{
            cancel: Partial<DialogButton<boolean>>;
            ok: Partial<DialogButton<boolean>>;
        }>;
        className?: string | undefined;
        onCancel?: (() => boolean) | undefined;
    }> | undefined): Promise<boolean>;
    info(msg: string, override?: Partial<{
        title?: string | undefined;
        content: string;
        icon?: ReactNode;
        buttons: Partial<{
            ok: Partial<DialogButton<void>>;
        }>;
        className?: string | undefined;
        onCancel?: (() => void) | undefined;
    }> | undefined): Promise<void>;
    show<T>(optios: DialogOptions<T>): Promise<T>;
};
export declare function mergeOption<T, U>(a: T, b: U): T & U;
export {};
//# sourceMappingURL=dialog.d.ts.map