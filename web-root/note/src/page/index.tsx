import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../assets/css/index.scss";
import { Page } from "./page";
import { SiteNavs } from "../data/site";
import { Note, NoteBoard } from "../data/note";
import { getCurrentUnixTime } from "../data/api";
import { NoteCard } from "../component/note-card";
import linq from "linq";
import classnames from "classnames";
import { IconEdit, IconLoading } from "../component/icon";
import { FixedOnScroll } from "../component/scroll-components";
import { Button } from "../component/button";
import { scrollToTop } from "../misc/utils";
import { FoldView } from "../component/fold-view";
import { PostNote } from "../component/post-note";
import { UserContext } from "../context/UserContext";
import { PublicUserInfo } from "../data/user";

function App()
{
    const [notes, setNotes] = useState([] as Note[]);
    const [time, setTime] = useState(getCurrentUnixTime());
    const [startIdx, setStartIdx] = useState(0);
    const [showPost, setShowPost] = useState(false);
    const [user, setUser] = useState({ name: "", uid: "", avatar: "/static/img/unknown-user-grey.png", url: "#" } as PublicUserInfo);
    const loadCount = 10;
    const loading = notes.length < startIdx;
    
    const loadComments = async () =>
    {
        if (startIdx > notes.length)
            return;
        setStartIdx(startIdx + loadCount);
        const newNotes = await NoteBoard.get({
            time: time,
            startIdx: startIdx,
            count: loadCount
        });
        setNotes([...notes, ...newNotes]);
    };
    const onScroll = () =>
    {
        const footer = document.querySelector(".page-footer");
        if (footer && footer.getBoundingClientRect().top < window.innerHeight)
            loadComments();
    };
    const postNewClick = () =>
    {
        scrollToTop(.3);
        if (!showPost)
            setShowPost(true);
    };
    const reload = () =>
    {
        setTime(getCurrentUnixTime());
        setStartIdx(0);
        setNotes([]);
    };
    const setUserContext = (user: PublicUserInfo) =>
    {
        setUser(user);
    }
    useEffect(() =>
    {
        window.addEventListener("scroll", onScroll);
        if (notes.length > 0)
            return () => window.removeEventListener("scroll", onScroll);
        if (startIdx == 0)
            loadComments();
        return () => window.removeEventListener("scroll", onScroll);
    });

    
    return (
        <UserContext.Provider value={{ login: false, user: user, setUser: setUserContext }}>
            <Page title="Message Board" nav={SiteNavs} currentNav="note">
                <FixedOnScroll className="side-area">
                    <header className="header">MESSAGE BOARD</header>
                    <Button className="new-post" onClick={postNewClick}>
                        <IconEdit />
                        <span>Post New</span>
                    </Button>
                    <Timeline notes={notes}/>
                </FixedOnScroll>
                <div className="notes-area">
                    <FoldView className="post-note-area" extend={showPost}>
                        <PostNote onPost={reload} />
                    </FoldView>
                    {notes.map((note, idx) => (<NoteCard note={note} key={idx} />))}

                    <div className="loading">
                        {loading ? <IconLoading className="spin" /> : null}
                    </div>
                </div>
            </Page>
        </UserContext.Provider>
    );
}

function Timeline(props: {notes: Note[]})
{
    const [focus, setFocus] = useState(0);

    const formatYM = (time: Date) => `${time.getFullYear()}-${time.getMonth() + 1}`;
    const focusTime = () => formatYM(new Date(props.notes[focus].time));

    const onScroll = () =>
    {
        const [top, idx] = linq.from(document.querySelectorAll(".note-card"))
            .select((card, idx) => [card.getBoundingClientRect().top, idx])
            .where(([top, idx]) => top > window.innerHeight * .1)
            .first();
        setFocus(idx);
    };
    useEffect(() =>
    {
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    });
    return (
        <ul className="timeline">
            {
                linq.from(props.notes)
                    .select(note => formatYM(new Date(note.time)))
                    .distinct()
                    .select((time, idx) => (<li className={classnames("time", { "current": time === focusTime() })} key={idx}>{time}</li>))
            }
        </ul>
    );
}

ReactDOM.render((<App />), document.querySelector("#root"));