import React, { useState, useRef } from "react";
import { IconEarth, IconEyeOff, IconSend, IconAsterisk } from "./icon";
import { Button } from "./button";
import gravatar from "gravatar";
import { NoteBoard } from "../data/note";
import classNames from "classnames";

export function PostNote(props: {onPost?:(pid:number)=>void})
{
    const [avatar, setAvatar] = useState("/static/img/unknown-user-grey.png");
    const [pub, setPublic] = useState(true);
    const [hint, setHint] = useState("none" as "name" | "email" | "url" | "public" | "secret" | "error");
    const refName = useRef(null as HTMLInputElement | null);
    const refEmail = useRef(null as HTMLInputElement | null);
    const refUrl = useRef(null as HTMLInputElement | null);
    const refText = useRef(null as HTMLInputElement | null);
    const hintText = {
        "none": " ",
        "name": "Your display name (Publicly visible).",
        "email": "Input email (not public) used for Gravatar and notifications (not implememnt yet :)",
        "url": "URL (public) to your web site",
        "public": "Your message is visible to all visitors.",
        "secret": "Your message will only be visible to Me (NOT implement yet :)"
    };
    const [error, setError] = useState("");

    const updateGravatar = () =>
    {
        const email = refEmail.current && refEmail.current.value;
        if (email)
            setAvatar(gravatar.url(email, {
                default: "https://cdn-global-static.sardinefish.com/img/unknown-user-grey.png",
                size: "256",
            }, true));
        else
            setAvatar("/static/img/unknown-user-grey.png");
    };

    const send = async() =>
    {
        try
        {
            const pid = await NoteBoard.post({}, {
                author: (refName.current as HTMLInputElement).value,
                email: (refEmail.current as HTMLInputElement).value,
                url: (refUrl.current as HTMLInputElement).value,
                text: (refText.current as HTMLDivElement).innerText
            });
            props.onPost && props.onPost(pid);
            (refText.current as HTMLDivElement).innerHTML = "";
        }
        catch (err)
        {
            setError(err.message);
            setHint("error");
        }
    }

    return (
        <form className="post-note" action="">
            <div className="decoration">
                <div className="bg"></div>
                <IconAsterisk />
            </div>
            <div className="author">
                <div className="avatar">
                    <img src={avatar} alt="avatar"/>
                </div>
                <div className="info">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            name="name"
                            ref={refName}
                            className="input-line input-name"
                            placeholder="Your Name"
                            spellCheck="false"
                            autoComplete="off"
                            onFocus={() => setHint("name")} />
                    </div>
                    <div className="input-wrapper email">
                        <input
                            type="email"
                            name="email"
                            ref={refEmail}
                            className="input-line input-email"
                            placeholder="Email"
                            onBlur={updateGravatar}
                            spellCheck="false"
                            onFocus={() => setHint("email")} />
                    </div>
                    <div className="input-wrapper url">
                        <input
                            type="url"
                            name="url"
                            ref={refUrl}
                            className="input-line input-url"
                            placeholder="Url (optional)"
                            spellCheck="false"
                            autoComplete="off"
                            onFocus={() => setHint("url")} />
                    </div>
                </div>
            </div>
            <div className="content">
                <div className="content-input" ref={refText} contentEditable="true" data-placeholder="Write somthing here..."></div>
            </div>
            <div className="action-panel">
                <span className={classNames("hint", {"error": hint==="error"})}>
                    { hint==="error" ? error : hintText[hint]}
                </span>
                <span className="avatar mobile">
                    <img src={avatar} alt="avatar"/>
                </span>
                <span className="access-control" onClick={() =>
                {
                    setPublic(!pub);
                    setHint((!pub) ? "public" : "secret");
                }}>
                    {pub
                        ? <span className="access public">
                            <IconEarth />
                            <span>Public</span>
                        </span>
                        : <span className="access private">
                            <IconEyeOff />
                            <span>Secret</span>
                        </span>
                    }
                </span>
                <Button className="send-button" onClick={send}>
                    <IconSend />
                </Button>
            </div>
        </form>
    )
}