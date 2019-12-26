import React, { useState, useEffect } from "react";
import { Comment } from "../data/comment";

export function Comments(props: {cid: number, loadComments?: boolean})
{
    const [comments, setComments] = useState(null as Comment[] | null);
    useEffect(() =>
    {
        if (!props.loadComments)
            return;
    });
    return (
        <>
        </>
    );
}