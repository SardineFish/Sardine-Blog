import clsx from "clsx";
import React, { useContext, useState } from "react";
import { createRoot } from "react-dom/client";
import { Icons, timeout } from "../misc";
import { Button } from "./button";
const DialogContext = React.createContext({
    dispose: () => { }
});
class PopupManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogs: []
        };
    }
    show(dialog) {
        this.setState({
            dialogs: [...this.state.dialogs, dialog]
        });
    }
    render() {
        const dispose = (dialog) => {
            const idx = this.state.dialogs.indexOf(dialog);
            this.state.dialogs.splice(idx, 1);
            this.setState({
                dialogs: [...this.state.dialogs]
            });
        };
        return (React.createElement(React.Fragment, null, this.state.dialogs.map((dialog, idx) => (React.createElement(DialogContext.Provider, { key: idx, value: { dispose: () => dispose(dialog) } }, dialog)))));
    }
}
function Dialog(props) {
    const buttonKeys = Object.keys(props.option.buttons);
    const [state, setState] = useState("show");
    const [buttonStates, setButtonStates] = useState(buttonKeys.map(() => undefined));
    const context = useContext(DialogContext);
    const dialogOption = props.option;
    const getButtonOption = (key) => props.option.buttons[key];
    const click = async (e, idx) => {
        const option = getButtonOption(buttonKeys[idx]);
        e.stopPropagation();
        e.preventDefault();
        let result = option.click();
        if (result instanceof Promise) {
            buttonStates.splice(idx, 1, "progress");
            setButtonStates([...buttonStates]);
            setState("progress");
            props.onClose(await result);
            close();
        }
        else {
            props.onClose(result);
            close();
        }
    };
    const cancel = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (props.option.onCancel) {
            props.onClose(props.option.onCancel());
            close();
        }
    };
    const close = async () => {
        if (state === "hide")
            return;
        setState("hide");
        await timeout(1000);
        context.dispose();
    };
    return (React.createElement("div", { className: clsx("dialog", "dialog-bg", state), onClick: cancel },
        React.createElement("div", { className: "wrapper" },
            dialogOption.title ? (React.createElement("header", { className: "title" }, dialogOption.title)) : null,
            dialogOption.icon ? (React.createElement("div", { className: "icon" }, dialogOption.icon)) : null,
            React.createElement("p", { className: "content" }, dialogOption.content),
            React.createElement("div", { className: "buttons" }, buttonKeys.map((key, idx) => (buttonStates[idx] === "progress"
                ? React.createElement(Button, { className: clsx(getButtonOption(key).type, "progress"), key: idx },
                    React.createElement(Icons.DotsCircle, null))
                : React.createElement(Button, { className: clsx(getButtonOption(key).type), onClick: (e) => click(e, idx), key: idx }, getButtonOption(key).content)))))));
}
const container = document.createElement("div");
container.className = "dialog-manager";
document.body.appendChild(container);
const DialogRef = React.createRef();
const root = createRoot(container);
root.render(React.createElement(PopupManager, { ref: DialogRef }));
export const dialog = {
    async confirm(msg, override) {
        return await this.show(mergeOption({
            className: "dialog-confirm",
            icon: React.createElement(Icons.InfoOutline, null),
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
    async info(msg, override) {
        return await this.show(mergeOption({
            title: "Info",
            className: "dialog-info",
            icon: React.createElement(Icons.InfoOutline, null),
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
    show(optios) {
        console.log(optios);
        return new Promise((resolve) => {
            DialogRef.current?.show(React.createElement(Dialog, { option: optios, onClose: (v) => resolve(v) }));
        });
    }
};
export function mergeOption(a, b) {
    const out = Object.assign({}, a, b);
    if (!b || !a)
        return out;
    for (const key in out) {
        const aField = a[key];
        const bField = b[key];
        if ((typeof aField === "object") && (typeof bField === "object")) {
            // Donot merge react element
            if (bField.$$typeof == Symbol.for('react.element') || bField.$$typeof == Symbol.for('react.element'))
                continue;
            out[key] = mergeOption(a[key], b[key]);
        }
    }
    return out;
}
window.dialog = dialog;
//# sourceMappingURL=dialog.js.map