import React, { useState, useRef, useEffect } from "react";
import { Note } from "../data/note";
import { IconView, IconLikeFill, IconLikeOutline, IconComment } from "./icon";
import classnames from "classnames";
import { PostData } from "../data/postData";
import { Comment } from "../data/comment";
import { FoldView } from "./fold-view";
import { CommentSystem } from "./comments";
import { urlWrapper } from "../misc/utils";

export function NoteCard(props: {note: Note})
{
    const [extend, setExtend] = useState(false);
    const refContent = useRef(null as HTMLParagraphElement | null);
    const [avatar, setAvatar] = useState(props.note.author.avatar);

    const extendComments = () =>
    {
        setExtend(!extend);
    };
    const onAvatarFailed = () =>
    {
        setAvatar("/static/img/unknown-user-grey.png");
    };
    useEffect(() =>
    {
        setAvatar(props.note.author.avatar);
        if (!refContent.current)
            return;
        if (props.note.author.level ===  "developer" || props.note.author.level === "admin")
            refContent.current.innerHTML = props.note.text;
    }, [props.note]);

    return (
        <section className="card note-card">
            <div className="visible-area">
                <header className="note-author">
                    <div className="avatar">
                        <img src={avatar} alt="avatar" onError={onAvatarFailed} />
                    </div>
                    <div className="info">
                        <a className="name" href={urlWrapper(props.note.author.url)}>{props.note.author.name}</a>
                        <span className="time">{props.note.time}</span>
                    </div>
                </header>
                <main className="note-content">
                    <p ref={refContent}>{props.note.text}</p>
                </main>
                <footer>
                    <div className="post-data">
                        <span className="item views">
                            <IconView />
                            <span className="value">{props.note.postData.views}</span>
                        </span>
                        <LikeButton className="item like" pid={props.note.pid} likes={props.note.postData.likes} />
                        <span className={classnames("item", "comments", { "extend": extend})} onClick={extendComments}>
                            <IconComment />
                            <span className="value">{props.note.postData.comments}</span>
                        </span>
                    </div>
                </footer>
            </div>
            <FoldView className="fold-area" extend={extend}>
                <CommentSystem cid={props.note.pid} loadComments={extend} />
            </FoldView>
        </section>
    )
}

function LikeButton(props: {pid: number, likes: number, className?: string})
{
    const [likes, setLikes] = useState(props.likes);
    const [liked, setLike] = useState(false);
    const hitLike = async () =>
    {
        if (liked)
            return;
        setLikes(likes + 1);
        setLike(true);
        await PostData.hitLike({}, { pid: props.pid });
    };
    return (
        <span className={classnames("like-button", { "liked": liked }, props.className)} onClick={hitLike}>
            {
                liked ? <IconLikeFill /> : <IconLikeOutline />
            }
            {
                <span className="value">
                    {likes}
                    <span className="plus-one">
                        +1s
                    </span>
                </span>
            }
        </span>
    );
}