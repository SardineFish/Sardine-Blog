import React, { createRef } from "react";
import ReactDOM, { } from "react-dom";
import { createRoot } from "react-dom/client";
import clsx from "clsx";
import { match } from "../misc/utils";
import { Icons } from "../misc/icons";

interface MessageOptions
{
    text: string,
    icon?: React.ReactNode,
    className?: string,
}

interface MessageState
{
    id: number,
    text: string,

    state: "show" | "present" | "hide",
    icon?: React.ReactNode,
    className?: string,
}

interface MessageProviderState
{
    messages: MessageState[],
}

const TIME_SHOW = 300;
const TIME_PRESENT = 2000;
const TIME_HIDE = 300;

class MessageProvider extends React.Component<{}, MessageProviderState>
{
    private nextId = 1;
    constructor(props: {})
    {
        super(props);
        this.state = { messages: [] };
    }
    show(options: MessageOptions)
    {
        const msg: MessageState = {
            id: this.nextId++,
            state: "show",
            text: options.text,
            className: options.className,
            icon: options.icon
        };
        this.setState({ messages: [...this.state.messages, msg] });

        setTimeout(() => this.updateMessage(msg), TIME_SHOW);
    }
    updateMessage(msg: MessageState)
    {
        switch (msg.state)
        {
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
    render()
    {
        return (<>
            {this.state.messages.map((msg, idx) => (<Message className={msg.className} key={idx} state={msg.state} icon={msg.icon}>{msg.text}</Message>))}
        </>)
    }
}

interface MessageProps
{
    state: "show" | "present" | "hide",
    icon?: React.ReactNode,
    className?: string,
    children?: React.ReactNode
}

function Message(props: MessageProps)
{
    return (<div className={clsx("message", props.state, props.className)}>
        <div className="message-block">
            {props.icon}
            <span className="text">{props.children}</span>
        </div>
    </div>)
}

const container = document.createElement("div");
container.id = "message-container";
document.body.appendChild(container);
const ref = createRef<MessageProvider>();
const root = createRoot(container);
root.render(<MessageProvider ref={ref} />);

export const message = {
    info(msg: string)
    {
        if (!ref.current)
            return;
        ref.current.show({
            text: msg,
            className: "info",
            icon: <Icons.AlertCircleOutline />
        });
    },
    warn(msg: string)
    {
        ref.current?.show({
            text: msg,
            className: "warn",
            icon: <Icons.AlertCircle/>
        });
    },
    error: (msg: string) => ref.current?.show({
        text: msg,
        className: "error",
        icon: <Icons.CloseCircle/>
    }),
    success: (msg: string) => ref.current?.show({
        text: msg,
        className: "success",
        icon: <Icons.CheckCircle/>
    }),
};

(window as any).message = message;