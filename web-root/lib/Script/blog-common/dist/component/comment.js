import React, { useState, useEffect, useContext, useRef } from "react";
import gravatar from "gravatar";
import { API } from "sardinefish";
import { Icons } from "../misc";
import clsx from "clsx";
import { UserContext } from "../misc/user-context";
const CommentContext = React.createContext({
    replyComment: null,
    cid: 0,
    setReply: (cid, comment) => { }
});
export function CommentSystem(props) {
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState(null);
    const [replyState, setReply] = useState({ cid: props.cid, replyComment: null });
    const levelLimit = props.levelLimit || 1;
    const reloadComments = async () => {
        console.log("Load comments");
        setLoading(true);
        const comments = await API.Comment.getByPid({ pid: props.cid });
        setComments(comments);
    };
    const setReplyContext = (cid, comment) => {
        if (comment === null)
            setReply({ cid: props.cid, replyComment: null });
        else
            setReply({ cid: cid, replyComment: comment });
    };
    const loadComments = props.loadComments === undefined ? true : props.loadComments;
    useEffect(() => {
        console.log(loading);
        setComments([]);
        if (!loadComments)
            return;
        reloadComments();
    }, [props.cid]);
    return (React.createElement(CommentContext.Provider, { value: { setReply: setReplyContext, ...replyState } },
        React.createElement("div", { className: "comment-system" },
            React.createElement(PostComment, { cid: props.cid, onPost: reloadComments }),
            comments === null
                ? React.createElement("div", { className: "comment-loading" },
                    React.createElement("div", { className: "decoration" },
                        React.createElement("div", { className: "circle-wrapper" },
                            React.createElement("div", { className: "circle " },
                                React.createElement(Icons.Loading, { className: "spin" }))),
                        React.createElement("div", { className: "line-wrapper" },
                            React.createElement("div", { className: "line" }))),
                    React.createElement("div", { className: "text-wrapper" },
                        React.createElement("div", { className: "text" }, "Loading...")))
                : React.createElement("ul", { className: "comment-area" }, comments.sort(sortTimeDesc)
                    .map((c, idx) => (React.createElement(CommentRenderer, { key: idx, comment: c, level: 0, levelLimit: levelLimit })))))));
}
function sortTimeDesc(a, b) {
    return new Date(b.time).getTime() - new Date(a.time).getTime();
}
function CommentRenderer(props) {
    const hasReplies = props.level < props.levelLimit && props.comment.comments.length > 0;
    const comment = props.comment;
    const user = props.comment.author;
    const timeString = API.Utils.formatDateTime(new Date(props.comment.time));
    const [avatar, setAvatar] = useState(user.avatar);
    const context = useContext(CommentContext);
    const avatarFailed = () => {
        setAvatar("/static/img/unknown-user-grey.png");
    };
    const replyClick = () => {
        context.setReply(comment.pid, comment);
    };
    useEffect(() => {
        setAvatar(props.comment.author.avatar);
    }, [props.comment]);
    return (React.createElement("li", { className: "comment" },
        React.createElement("div", { className: "decoration" },
            React.createElement("div", { className: "circle-wrapper" },
                React.createElement("div", { className: "circle button button-reply", onClick: replyClick },
                    React.createElement(Icons.Reply, null))),
            React.createElement("div", { className: "line-wrapper" },
                React.createElement("div", { className: "line" }))),
        React.createElement("div", { className: "ver-wrapper" },
            React.createElement("div", { className: "hor-wrapper" },
                React.createElement("div", { className: "avatar-wrapper" },
                    React.createElement("img", { src: avatar, className: "avatar", onError: avatarFailed }),
                    React.createElement("div", { className: ["line", hasReplies ? "show" : "hide"].join(" ") })),
                React.createElement("div", { className: "comment-wrapper" },
                    React.createElement("header", { className: "sender-info" },
                        React.createElement("a", { className: "name", href: urlDefault(user.url), target: "_blank" }, user.name),
                        React.createElement("span", { className: "time" }, timeString)),
                    React.createElement("main", { className: "comment-text" }, comment.text))),
            React.createElement("ul", { className: "replies" }, comment.comments.map((reply, idx) => (React.createElement(CommentRenderer, { comment: reply, key: idx, level: props.level + 1, levelLimit: props.levelLimit })))))));
}
function PostComment(props) {
    const commentCtx = useContext(CommentContext);
    const userCtx = useContext(UserContext);
    const [sending, setSending] = useState(false);
    const [postVisible, setPostVisible] = useState(false);
    const [hint, setHint] = useState("none");
    const [error, setError] = useState("");
    const [avatar, setAvatar] = useState(userCtx.user.avatar);
    const hintText = {
        "none": " ",
        "name": "Input display name (public visible).",
        "email": "Input email (not public) used for Gravatar and notifications (not implememnt yet :)",
        "url": "URL (public) to your web site",
    };
    const refName = useRef(null);
    const refEmail = useRef(null);
    const refUrl = useRef(null);
    const refText = useRef(null);
    useEffect(() => {
        if (props.cid != commentCtx.cid)
            setPostVisible(true);
    }, [commentCtx.cid]);
    const resetReply = () => {
        commentCtx.setReply(0, null);
    };
    const addCommentClick = () => {
        setPostVisible(true);
        resetReply();
    };
    const onEmailBlur = () => {
        const email = refEmail.current && refEmail.current.value;
        if (email)
            setAvatar(gravatar.url(email, {
                default: "https://cdn-static.sardinefish.com/img/unknown-user-grey.png",
                size: "256",
            }, true));
        else
            setAvatar("/static/img/unknown-user-grey.png");
    };
    const blockClick = (e) => {
        e.stopPropagation();
    };
    const backgroundClick = () => {
        setPostVisible(false);
        resetReply();
    };
    const send = async () => {
        setSending(true);
        try {
            const email = refEmail.current.value;
            const avatar = gravatar.url(email, {
                default: "https://cdn-static.sardinefish.com/img/unknown-user-grey.png",
                size: "256",
            }, true);
            const pid = await API.Comment.post({
                pid: commentCtx.cid,
            }, {
                name: refName.current.value,
                email: email,
                url: refUrl.current.value,
                avatar: avatar,
                text: refText.current.innerText,
            });
            refText.current.innerHTML = "";
            props.onPost && props.onPost();
            setPostVisible(false);
        }
        catch (err) {
            setError(err.message);
            setHint("error");
        }
        setSending(false);
    };
    return (React.createElement("div", { className: "post-area" },
        React.createElement("div", { className: "decoration" },
            React.createElement("div", { className: "circle-wrapper" },
                React.createElement("div", { className: "circle button button-reply", onClick: addCommentClick },
                    React.createElement(Icons.Plus, null))),
            React.createElement("div", { className: "line-wrapper" },
                React.createElement("div", { className: "line" }))),
        React.createElement("p", { className: "post-hint", onClick: addCommentClick }, "Click to comment"),
        React.createElement("div", { className: clsx("comment-poster", { "show": postVisible }, { "hide": !postVisible }), onClick: backgroundClick },
            React.createElement("div", { className: "hor-wrapper", onClick: blockClick },
                React.createElement("div", { className: "avatar-wrapper" },
                    React.createElement("img", { src: avatar, className: "avatar" }),
                    React.createElement("div", { className: "line" })),
                React.createElement("div", { className: "input-area" },
                    React.createElement("div", { className: "info-wrapper" },
                        React.createElement("div", { className: "user-info" },
                            React.createElement("div", { className: "hor-wrapper" },
                                React.createElement("div", { className: "input-wrapper" },
                                    React.createElement("input", { type: "text", ref: refName, className: "text-input input-name", placeholder: "Your Name", onFocus: () => setHint("name") })),
                                React.createElement("div", { className: "input-wrapper" },
                                    React.createElement("input", { type: "email", ref: refEmail, className: "text-input input-email", placeholder: "Email", onFocus: () => setHint("email"), onBlur: onEmailBlur }))),
                            React.createElement("input", { type: "url", ref: refUrl, className: "text-input input-url", placeholder: "URL (optional)", onFocus: () => setHint("url") })),
                        React.createElement("div", { className: ["button", "button-send", sending ? "sending" : ""].join(" "), onClick: send }, sending
                            ? React.createElement(Icons.Loading, { className: "spin" })
                            : React.createElement(Icons.Send, null))),
                    React.createElement("div", { className: "text-input input-comment", contentEditable: true, ref: refText, "data-placeholder": commentCtx.replyComment === null
                            ? "Tell me what you think"
                            : `Reply to ${commentCtx.replyComment.author.name}` }),
                    React.createElement("p", { className: clsx("hint", hint) }, hint === "error" ? error : hintText[hint]),
                    React.createElement("div", { className: "mobile-layout" },
                        React.createElement("div", { className: "avatar-wrapper" },
                            React.createElement("img", { src: avatar, className: "avatar" }),
                            React.createElement("div", { className: "line" })),
                        React.createElement("div", { className: ["button", "button-send", "mobile", sending ? "sending" : ""].join(" "), onClick: send }, sending
                            ? React.createElement(Icons.Loading, { className: "spin" })
                            : React.createElement(Icons.Send, null))))))));
}
function urlDefault(url) {
    if (!url || /^\s*$/.test(url))
        return "#";
    if (!/^https?:\/\//i.test(url))
        return `//${url}`;
    return url;
}
//# sourceMappingURL=comment.js.map