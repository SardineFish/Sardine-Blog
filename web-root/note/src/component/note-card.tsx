import React, { useState, useRef, useEffect } from "react";
import { IconView, IconLikeFill, IconLikeOutline, IconComment } from "./icon";
import classnames from "classnames";
import { FoldView } from "./fold-view";
import { CommentSystem } from "./comments";
import { urlDefault } from "../misc/utils";
import API, { DocType, Note } from "../../../lib/Script/SardineFish/SardineFish.API";

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
        if (props.note.doc_type === DocType.HTML)
            refContent.current.innerHTML = props.note.doc;
    }, [props.note]);

    return (
        <section className="card note-card">
            <div className="visible-area">
                <header className="note-author">
                    <div className="avatar">
                        <img src={avatar} alt="avatar" onError={onAvatarFailed} />
                    </div>
                    <div className="info">
                        <a className="name" href={urlDefault(props.note.author.url || "")}>{props.note.author.name}</a>
                        <span className="time">{new Date(props.note.time).toLocaleString()}</span>
                    </div>
                </header>
                <main className="note-content">
                    <p ref={refContent}>{props.note.doc}</p>
                </main>
                <footer>
                    <div className="post-data">
                        <span className="item views">
                            <IconView />
                            <span className="value">{props.note.stats.views}</span>
                        </span>
                        <LikeButton className="item like" pid={props.note.pid} likes={props.note.stats.likes} />
                        <span className={classnames("item", "comments", { "extend": extend})} onClick={extendComments}>
                            <IconComment />
                            <span className="value">{props.note.stats.comments}</span>
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
        {
            setLikes(await API.PostData.dislike({ pid: props.pid }));
            setLike(false);
        }
        else
        {
            setLikes(await API.PostData.like({ pid: props.pid }, {}));
            setLike(true);
        }
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