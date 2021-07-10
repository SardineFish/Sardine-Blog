import React, { createRef } from "react";
import ReactDOM from "react-dom";
import clsx from "clsx";
import { match } from "../misc/utils";
import { Icons } from "../misc/icons";

interface MessageState
{
    id: number,
    state: "show" | "present" | "hide",
    text: string,
    type: "info" | "warn" | "error",
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
    show(text: string, type: "info" | "warn" | "error")
    {
        const msg: MessageState = {
            id: this.nextId++,
            state: "show",
            text,
            type,
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
            {this.state.messages.map((msg, idx) => (<Message type={msg.type} key={idx} state={msg.state}>{msg.text}</Message>))}
        </>)
    }
}

function Message(props: { children?: React.ReactNode, state: "show" | "present" | "hide", type: "info" | "warn" | "error"})
{
    return (<div className={clsx("message", props.state, props.type)}>
        <div className="message-block">
            {match(props.type, {
                "info": <Icons.AlertCircleOutline className="icon" />,
                "warn": <Icons.AlertCircle className="icon" />,
                "error": <Icons.CloseCircle className="icon" />,
            })}
            <span className="text">{props.children}</span>
        </div>
    </div>)
}

const container = document.createElement("div");
container.id = "message-container";
document.body.appendChild(container);
const ref = createRef<MessageProvider>();
ReactDOM.render(<MessageProvider ref={ref} />, container);

export const message = {
    info(msg: string)
    {
        if (!ref.current)
            return;
        ref.current.show(msg, "info");
    },
    warn(msg: string)
    {
        ref.current?.show(msg, "warn");
    },
    error:(msg: string) => ref.current?.show(msg, "error"),
}