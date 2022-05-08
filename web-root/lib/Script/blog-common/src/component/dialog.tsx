import clsx from "clsx";
import React, { MouseEvent, ReactNode, useContext, useState } from "react";
import { createRoot } from "react-dom/client";
import { error, Icons, timeout } from "../misc";
import { Button } from "./button";

const DialogContext = React.createContext({
    dispose: () => { }
});

interface PopupState
{
    dialogs: React.ReactNode[],
}

class PopupManager extends React.Component<{}, PopupState>
{
    constructor(props: {})
    {
        super(props);

        this.state = {
            dialogs: []
        };
    }
    show(dialog: React.ReactNode)
    {
        this.setState({
            dialogs: [...this.state.dialogs, dialog]
        });
    }
    render(): React.ReactNode
    {
        const dispose = (dialog: ReactNode) =>
        {
            const idx = this.state.dialogs.indexOf(dialog);
            this.state.dialogs.splice(idx, 1);
            this.setState({
                dialogs: [...this.state.dialogs]
            });
        };

        return (<>
            {
                this.state.dialogs.map((dialog, idx) => (<DialogContext.Provider key={idx} value={{ dispose: () => dispose(dialog) }}>
                    {dialog}
                </DialogContext.Provider>))
            }
        </>);
    }
}

interface DialogProps<T>
{
    option: DialogOptions<T>,
    onClose: (value: T) => void,
}

function Dialog<T>(props: DialogProps<T>)
{
    const buttonKeys = Object.keys(props.option.buttons) as (string | number)[];
    const [state, setState] = useState<"show" | "hide" | "progress">("show");
    const [buttonStates, setButtonStates] = useState(buttonKeys.map(() => undefined as "progress" | undefined));
    const context = useContext(DialogContext);
    const dialogOption = props.option;
    const getButtonOption = (key: number | string) => (props.option.buttons as any)[key] as DialogButton<T>;
    const click = async (e: MouseEvent<HTMLSpanElement>, idx: number) =>
    {
        const option = getButtonOption(buttonKeys[idx]);

        e.stopPropagation();
        e.preventDefault();
        let result = option.click();
        if (result instanceof Promise)
        {
            buttonStates.splice(idx, 1, "progress");
            setButtonStates([...buttonStates]);
            setState("progress");
            props.onClose(await result);
            close();
        }
        else
        {
            props.onClose(result);
            close();
        }
    };
    const cancel = (e: MouseEvent<HTMLDivElement>) =>
    {
        e.stopPropagation();
        e.preventDefault();

        if (props.option.onCancel)
        {
            props.onClose(props.option.onCancel());
            close();
        }
    }
    const close = async () =>
    {
        if (state === "hide")
            return;
        setState("hide");
        await timeout(1000);
        context.dispose();
    };
    return (<div className={clsx("dialog", "dialog-bg", state)} onClick={cancel}>
        <div className="wrapper" >
            {dialogOption.title ? (<header className="title">{dialogOption.title}</header>) : null}
            {dialogOption.icon ? (<div className="icon">{dialogOption.icon}</div>) : null}
            <p className="content">{dialogOption.content}</p>
            <div className="buttons">
                {buttonKeys.map((key, idx) => (
                    buttonStates[idx] === "progress"
                        ? <Button className={clsx(getButtonOption(key).type, "progress")} key={idx}><Icons.DotsCircle/></Button>
                        : <Button className={clsx(getButtonOption(key).type)} onClick={(e) => click(e, idx)} key={idx}>{getButtonOption(key).content}</Button>
                ))}
            </div>
        </div>
    </div>)
}

const container = document.createElement("div");
container.className = "dialog-manager";
document.body.appendChild(container);

const DialogRef = React.createRef<PopupManager>();

const root = createRoot(container);
root.render(<PopupManager ref={DialogRef} />);

export interface DialogButton<T = void>
{
    content: ReactNode,
    click: (() => T) | (() => Promise<T>),
    type?: "normal" | "primary" | "disabled",
}

type ButtonConfigs<T> = { [key: number]: DialogButton<T> } | { [key: string]: DialogButton<T> };

export interface DialogOptions<T = void>
{
    title?: string,
    content: string,
    icon?: ReactNode,
    buttons: ButtonConfigs<T>,
    className?: string,
    onCancel?: () => T,
}

type DialogOptionsOverride<T, K extends string | number> = Partial<
    {
        title?: string,
        content: string,
        icon?: ReactNode,
        buttons: Partial<{ [key in K]: Partial<DialogButton<T>> }>,
        className?: string,
        onCancel?: () => T,
    }>;

export const dialog = {
    async confirm(msg: string, override?: DialogOptionsOverride<boolean, "ok" | "cancel">)
    {
        return await this.show<boolean>(mergeOption({
            className: "dialog-confirm",
            icon: <Icons.InfoOutline />,
            content: msg,
            onCancel: () => false,
            buttons: {
                ok: {
                    content: "Ok",
                    click: () => true,
                    type: "primary",
                },
                cancel: {
                    content: "Cancel",
                    click: () => false,
                }
            }
        }, override));
    },
    async info(msg: string, override?: DialogOptionsOverride<void, "ok">)
    {
        return await this.show(mergeOption({
            title: "Info",
            className: "dialog-info",
            icon: <Icons.InfoOutline />,
            content: msg,
            onCancel: () => { },
            buttons: {
                ok: {
                    content: "Ok",
                    click: () => { },
                    type: "primary",
                },
            }
        }, override));
    },
    show<T>(optios: DialogOptions<T>): Promise<T>
    {
        console.log(optios);
        return new Promise((resolve) =>
        {
            DialogRef.current?.show(<Dialog option={optios} onClose={(v) => resolve(v)} />)
        });
    }
};



export function mergeOption<T, U>(a: T, b: U): T & U
{
    const out = Object.assign({}, a, b);
    if (!b || !a)
        return out;
    for (const key in out)
    {
        const aField = (a as any)[key];
        const bField = (b as any)[key];
        if ((typeof aField ==="object") && (typeof bField === "object"))
        {
            // Donot merge react element
            if (bField.$$typeof == Symbol.for('react.element') || bField.$$typeof    == Symbol.for('react.element'))
                continue;
            
            (out as any)[key] = mergeOption((a as any)[key], (b as any)[key]);
        }
    }
    return out;
}


(window as any).dialog = dialog;