import React, { createRef } from "react";
import { createRoot } from "react-dom/client";
import clsx from "clsx";
import { Icons } from "../misc/icons";
const TIME_SHOW = 300;
const TIME_PRESENT = 2000;
const TIME_HIDE = 300;
class MessageProvider extends React.Component {
    nextId = 1;
    constructor(props) {
        super(props);
        this.state = { messages: [] };
    }
    show(options) {
        const msg = {
            id: this.nextId++,
            state: "show",
            text: options.text,
            className: options.className,
            icon: options.icon
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
        return (React.createElement(React.Fragment, null, this.state.messages.map((msg, idx) => (React.createElement(Message, { className: msg.className, key: idx, state: msg.state, icon: msg.icon }, msg.text)))));
    }
}
function Message(props) {
    return (React.createElement("div", { className: clsx("message", props.state, props.className) },
        React.createElement("div", { className: "message-block" },
            props.icon,
            React.createElement("span", { className: "text" }, props.children))));
}
const container = document.createElement("div");
container.id = "message-container";
document.body.appendChild(container);
const ref = createRef();
const root = createRoot(container);
root.render(React.createElement(MessageProvider, { ref: ref }));
export const message = {
    info(msg) {
        if (!ref.current)
            return;
        ref.current.show({
            text: msg,
            className: "info",
            icon: React.createElement(Icons.AlertCircleOutline, null)
        });
    },
    warn(msg) {
        ref.current?.show({
            text: msg,
            className: "warn",
            icon: React.createElement(Icons.AlertCircle, null)
        });
    },
    error: (msg) => ref.current?.show({
        text: msg,
        className: "error",
        icon: React.createElement(Icons.CloseCircle, null)
    }),
    success: (msg) => ref.current?.show({
        text: msg,
        className: "success",
        icon: React.createElement(Icons.CheckCircle, null)
    }),
};
window.message = message;
//# sourceMappingURL=message.js.map