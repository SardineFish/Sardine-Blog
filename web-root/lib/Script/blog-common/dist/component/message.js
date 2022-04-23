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
exports.message = void 0;
const react_1 = __importStar(require("react"));
const client_1 = require("react-dom/client");
const clsx_1 = __importDefault(require("clsx"));
const utils_1 = require("../misc/utils");
const icons_1 = require("../misc/icons");
const TIME_SHOW = 300;
const TIME_PRESENT = 2000;
const TIME_HIDE = 300;
class MessageProvider extends react_1.default.Component {
    nextId = 1;
    constructor(props) {
        super(props);
        this.state = { messages: [] };
    }
    show(text, type) {
        const msg = {
            id: this.nextId++,
            state: "show",
            text,
            type,
        };
        this.setState({ messages: [...this.state.messages, msg] });
        setTimeout(() => this.updateMessage(msg), TIME_SHOW);
    }
    updateMessage(msg) {
        switch (msg.state) {
            case "show":
                msg.state = "present";
                this.setState({});
                setTimeout(() => this.updateMessage(msg), TIME_PRESENT);
                break;
            case "present":
                msg.state = "hide";
                this.setState({});
                setTimeout(() => this.updateMessage(msg), TIME_HIDE);
                break;
            case "hide":
                this.setState({ messages: this.state.messages.splice(this.state.messages.indexOf(msg)) });
                break;
        }
    }
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null, this.state.messages.map((msg, idx) => (react_1.default.createElement(Message, { type: msg.type, key: idx, state: msg.state }, msg.text)))));
    }
}
function Message(props) {
    return (react_1.default.createElement("div", { className: (0, clsx_1.default)("message", props.state, props.type) },
        react_1.default.createElement("div", { className: "message-block" },
            (0, utils_1.match)(props.type, {
                "info": react_1.default.createElement(icons_1.Icons.AlertCircleOutline, { className: "icon" }),
                "warn": react_1.default.createElement(icons_1.Icons.AlertCircle, { className: "icon" }),
                "error": react_1.default.createElement(icons_1.Icons.CloseCircle, { className: "icon" }),
            }),
            react_1.default.createElement("span", { className: "text" }, props.children))));
}
const container = document.createElement("div");
container.id = "message-container";
document.body.appendChild(container);
const ref = (0, react_1.createRef)();
const root = (0, client_1.createRoot)(container);
root.render(react_1.default.createElement(MessageProvider, { ref: ref }));
exports.message = {
    info(msg) {
        if (!ref.current)
            return;
        ref.current.show(msg, "info");
    },
    warn(msg) {
        ref.current?.show(msg, "warn");
    },
    error: (msg) => ref.current?.show(msg, "error"),
};
window.message = exports.message;
//# sourceMappingURL=message.js.map