import React, { useState, useEffect, useContext, useRef, MouseEvent } from "react";
import { IconReply, IconAdd, IconLoading, IconSend } from "./icon";
import { UserContext } from "../context/UserContext";
import linq from "linq";
import gravatar from "gravatar";
import calssNames from "classnames";
import { urlDefault } from "../misc/utils";
import API, { Comment, DocType } from "../../../lib/Script/SardineFish/SardineFish.API";

const CommentContext = React.createContext({
    replyComment: null as Comment | null,
    cid: 0,
    setReply: (cid: number, comment: Comment | null) => { }
});

export function CommentSystem(props: {cid: number, loadComments?: boolean, levelLimit?:number})
{
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState(null as Comment[] | null);
    const [replyState, setReply] = useState({ cid: props.cid, replyComment: null as Comment | null });
    const levelLimit = props.levelLimit || 1;
    const reloadComments = async () =>
    {
        setLoading(true);
        const comments = await API.Comment.getByPid({ pid: props.cid });
        
        setComments(comments);
    };
    const setReplyContext = (cid:number, comment: Comment | null) =>
    {
        if (comment === null)
            setReply({ cid: props.cid, replyComment: null });
        else
            setReply({ cid: cid, replyComment: comment });
    };
    useEffect(() =>
    {
        if (!props.loadComments)
            return;
        if (!loading)
            reloadComments();
    });
    return (
        <CommentContext.Provider value={{setReply: setReplyContext, ...replyState}}>
            <div className="comment-system">
                <PostComment cid={props.cid} onPost={reloadComments}/>
                {comments === null
                    ? <div className="comment-loading">
                        <div className="decoration">
                            <div className="circle-wrapper">
                                <div className="circle ">
                                    <IconLoading className="spin" />
                                </div>
                            </div>
                            <div className="line-wrapper">
                                <div className="line"></div>
                            </div>
                        </div>
                        <div className="text-wrapper">
                            <div className="text">Loading...</div>
                        </div>
                    </div>
                    : <ul className="comment-area">
                        {
                            linq.from(comments)
                                .orderByDescending(c => new Date(c.time).getTime())
                                .select((c, idx) => (<CommentRenderer key={idx} comment={c} level={0} levelLimit={levelLimit}/>))
                                .toArray()
                        }
                    </ul>
                }
            </div>
        </CommentContext.Provider>
    );
}

function CommentRenderer(props: { comment: Comment, level: number, levelLimit: number })
{
    const hasReplies = props.level < props.levelLimit && props.comment.comments.length > 0;
    const comment = props.comment;
    const user = props.comment.author;
    const timeString = API.Utils.formatDateTime(new Date(props.comment.time));
    const [avatar, setAvatar] = useState(user.avatar,   );
    const context = useContext(CommentContext);
    const avatarFailed = () =>
    {
        setAvatar("/static/img/unknown-user-grey.png");
    };
    const replyClick = () =>
    {
        context.setReply(comment.pid, comment);
    }
    useEffect(() =>
    {
        setAvatar(props.comment.author.avatar);
    }, [props.comment]);

    return (
        <li className="comment">
            <div className="decoration">
                <div className="circle-wrapper">
                    <div className="circle button button-reply" onClick={replyClick}>
                        <IconReply />
                    </div>
                </div>
                <div className="line-wrapper">
                    <div className="line"></div>
                </div>
            </div>
            <div className="ver-wrapper">
                <div className="hor-wrapper">
                    <div className="avatar-wrapper">
                        <img src={avatar} className="avatar" onError={avatarFailed} />
                        <div className={["line", hasReplies ? "show" : "hide"].join(" ")}></div>
                    </div>
                    <div className="comment-wrapper">
                        <header className="sender-info">
                            <a className="name" href={urlDefault(user.url)} target="_blank">{user.name}</a>
                            <span className="time">{timeString}</span>
                        </header>
                        <main className="comment-text">{comment.text}</main>
                    </div>
                </div>
                <ul className="replies">
                    {
                        comment.comments.map((reply, idx) => (
                            <CommentRenderer comment={reply} key={idx} level={props.level + 1} levelLimit={props.levelLimit}/>
                        ))
                    }
                </ul>
            </div>
        </li>
    )
}

function PostComment(props: { cid: number, onPost?:()=>void })
{
    const commentCtx = useContext(CommentContext);
    const userCtx = useContext(UserContext);

    const [sending, setSending] = useState(false);
    const [postVisible, setPostVisible] = useState(false);
    const [hint, setHint] = useState("none" as "name" | "email" | "url" | "error");
    const [error, setError] = useState("");
    const [avatar, setAvatar] = useState(userCtx.user.avatar);
    
    const hintText = {
        "none": " ",
        "name": "Input display name (public visible).",
        "email": "Input email (not public) used for Gravatar and notifications (not implememnt yet :)",
        "url": "URL (public) to your web site",
    };

    const refName = useRef(null as HTMLInputElement | null);
    const refEmail = useRef(null as HTMLInputElement | null);
    const refUrl = useRef(null as HTMLInputElement | null);
    const refText = useRef(null as HTMLInputElement | null);

    useEffect(() =>
    {
        if (props.cid != commentCtx.cid)
            setPostVisible(true);
    }, [commentCtx.cid]);

    const resetReply = () =>
    {
        commentCtx.setReply(0, null);
    };
    const addCommentClick = () =>
    {
        setPostVisible(true);
        resetReply();
    }
    const onEmailBlur = () =>
    {
        const email = refEmail.current && refEmail.current.value;
        if (email)
            setAvatar(gravatar.url(email, {
                default: "https://cdn-static.sardinefish.com/img/unknown-user-grey.png",
                size: "256",
            }, true));
        else
            setAvatar("/static/img/unknown-user-grey.png");
    };
    const blockClick = (e: MouseEvent) =>
    {
        e.stopPropagation();
    };
    const backgroundClick = () =>
    {
        setPostVisible(false);
        resetReply();
    };
    const send = async () =>
    {
        setSending(true);
        try
        {
            const email = (refEmail.current as HTMLInputElement).value;
            const avatar = gravatar.url(email, {
                default: "https://cdn-static.sardinefish.com/img/unknown-user-grey.png",
                size: "256",
            }, true);

            const pid = await API.Comment.post({
                pid: commentCtx.cid,
            }, {
                name: (refName.current as HTMLInputElement).value,
                email: email,
                url: (refUrl.current as HTMLInputElement).value,
                avatar: avatar,
                text: (refText.current as HTMLDivElement).innerText,
            });
                
            (refText.current as HTMLDivElement).innerHTML = "";

            props.onPost && props.onPost();
            setPostVisible(false);
        }
        catch (err)
        {
            setError(err.message);
            setHint("error");
        }
        setSending(false);
    };
    return (
        <div className="post-area">
            <div className="decoration">
                <div className="circle-wrapper">
                    <div className="circle button button-reply" onClick={addCommentClick}>
                        <IconAdd />
                    </div>
                </div>
                <div className="line-wrapper">
                    <div className="line"></div>
                </div>
            </div>
            <p className="post-hint" onClick={addCommentClick}>Click to comment</p>
            <div className={calssNames("comment-poster", {"show": postVisible}, {"hide": !postVisible})} onClick={backgroundClick}>
                <div className="hor-wrapper" onClick={blockClick}>
                    <div className="avatar-wrapper">
                        <img src={avatar} className="avatar" />
                        <div className="line"></div>
                    </div>
                    <div className="input-area">
                        <div className="info-wrapper">
                            <div className="user-info">
                                <div className="hor-wrapper">
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            ref={refName}
                                            className="text-input input-name"
                                            placeholder="Your Name"
                                            onFocus={() => setHint("name")}
                                        />
                                    </div>
                                    <div className="input-wrapper">
                                        <input
                                            type="email"
                                            ref={refEmail}
                                            className="text-input input-email"
                                            placeholder="Email"
                                            onFocus={() => setHint("email")}
                                            onBlur={onEmailBlur}
                                        />
                                    </div>
                                </div>
                                <input
                                    type="url"
                                    ref={refUrl}
                                    className="text-input input-url"
                                    placeholder="URL (optional)"
                                    onFocus={() => setHint("url")}
                                />
                            </div>
                            <div className={["button", "button-send", sending ? "sending" : ""].join(" ")} onClick={send}>
                                {
                                    sending
                                        ? <IconLoading className="spin" />
                                        : <IconSend />
                                }
                            </div>
                        </div>
                        <div
                            className="text-input input-comment"
                            contentEditable={true}
                            ref={refText}
                            data-placeholder={commentCtx.replyComment === null
                                ? "Tell me what you think"
                                : `Reply to ${commentCtx.replyComment.author.name}`}>
                        </div>
                        <p className={calssNames("hint", hint)}>
                            {hint === "error" ? error : hintText[hint]}
                        </p>
                        <div className="mobile-layout">
                            <div className="avatar-wrapper">
                                <img src={avatar} className="avatar" />
                                <div className="line"></div>
                            </div>
                            <div className={["button", "button-send", "mobile", sending ? "sending" : ""].join(" ")} onClick={send}>
                                {
                                    sending
                                        ? <IconLoading className="spin" />
                                        : <IconSend />
                                }
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}