"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeOption = exports.dialog = void 0;
const clsx_1 = __importDefault(require("clsx"));
const react_1 = __importStar(require("react"));
const client_1 = require("react-dom/client");
const misc_1 = require("../misc");
const button_1 = require("./button");
const DialogContext = react_1.default.createContext({
    dispose: () => { }
});
class PopupManager extends react_1.default.Component {
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
        return (react_1.default.createElement(react_1.default.Fragment, null, this.state.dialogs.map((dialog, idx) => (react_1.default.createElement(DialogContext.Provider, { key: idx, value: { dispose: () => dispose(dialog) } }, dialog)))));
    }
}
function Dialog(props) {
    const buttonKeys = Object.keys(props.option.buttons);
    const [state, setState] = (0, react_1.useState)("show");
    const [buttonStates, setButtonStates] = (0, react_1.useState)(buttonKeys.map(() => undefined));
    const context = (0, react_1.useContext)(DialogContext);
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
        await (0, misc_1.timeout)(1000);
        context.dispose();
    };
    return (react_1.default.createElement("div", { className: (0, clsx_1.default)("dialog", "dialog-bg", state), onClick: cancel },
        react_1.default.createElement("div", { className: "wrapper" },
            dialogOption.title ? (react_1.default.createElement("header", { className: "title" }, dialogOption.title)) : null,
            dialogOption.icon ? (react_1.default.createElement("div", { className: "icon" }, dialogOption.icon)) : null,
            react_1.default.createElement("p", { className: "content" }, dialogOption.content),
            react_1.default.createElement("div", { className: "buttons" }, buttonKeys.map((key, idx) => (buttonStates[idx] === "progress"
                ? react_1.default.createElement(button_1.Button, { className: (0, clsx_1.default)(getButtonOption(key).type, "progress"), key: idx },
                    react_1.default.createElement(misc_1.Icons.DotsCircle, null))
                : react_1.default.createElement(button_1.Button, { className: (0, clsx_1.default)(getButtonOption(key).type), onClick: (e) => click(e, idx), key: idx }, getButtonOption(key).content)))))));
}
const container = document.createElement("div");
container.className = "dialog-manager";
document.body.appendChild(container);
const DialogRef = react_1.default.createRef();
const root = (0, client_1.createRoot)(container);
root.render(react_1.default.createElement(PopupManager, { ref: DialogRef }));
exports.dialog = {
    async confirm(msg, override) {
        return await this.show(mergeOption({
            className: "dialog-confirm",
            icon: react_1.default.createElement(misc_1.Icons.InfoOutline, null),
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
            icon: react_1.default.createElement(misc_1.Icons.InfoOutline, null),
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
            DialogRef.current?.show(react_1.default.createElement(Dialog, { option: optios, onClose: (v) => resolve(v) }));
        });
    }
};
function mergeOption(a, b) {
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
exports.mergeOption = mergeOption;
window.dialog = exports.dialog;
//# sourceMappingURL=dialog.js.map