import { CommentSystem, DataValue, Form, IconButton, Icons, LargeLikeButton, message } from "blog-common";
import React, { useState, useEffect } from "react";
import { API, GalleryExhibit, PubPostData } from "sardinefish";
import { ExhibitMetaPrototype } from "./exhibit-editor";
import { AlbumMeta, PhotoMeta } from "./exhibit";
import { decodeShutterSpeed } from "../utils";
import clsx from "clsx";
import FreeViewport from "blog-common/dist/component/free-viewport";

export function ExhibitDetail(props: { pid: number, visible: boolean, onClose: () => void })
{
    const [data, setData] = useState<PubPostData<GalleryExhibit<PhotoMeta | AlbumMeta>>>();
    const [imgIdx, setImgIx] = useState(0);
    const [showProps, setShowProps] = useState(true);
    const viewportRef = React.useRef<FreeViewport>(null);

    const isAlbum = (data?.content.meta.type) === "Album";

    useEffect(() =>
    {
        setData(undefined);
        setImgIx(0);
        if (!props.pid)
            return;
        if (viewportRef.current)
            viewportRef.current.reset();

        (async () =>
        {
            try
            {
                const data = await API.Gallery.get({ pid: props.pid });
                setData(data as PubPostData<GalleryExhibit<PhotoMeta | AlbumMeta>>);
                setImgIx(0);
            }
            catch (err)
            {
                message.error((err as Error).message);
            }

        })();
    }, [props.pid]);

    let properties: DataValue<typeof ExhibitMetaPrototype> | undefined;
    let imgUrl: string | undefined;
    if (data && data.content.meta.type === "Photo")
    {
        properties = parseMeta(data.content, data.content.meta);
        imgUrl = data.content.url;
    }
    else if (data && data.content.meta.type === "Album")
    {
        properties = parseMeta(data.content, data.content.meta.album[imgIdx].meta);
        imgUrl = data.content.meta.album[imgIdx].url;
    }

    const scroll = (e: React.UIEvent<HTMLDivElement>) =>
    {
        if (props.visible)
        {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    const rootRef = React.useRef<HTMLDivElement>(null);

    const onWheel = (e: React.WheelEvent<HTMLDivElement>) =>
    {
        if (props.visible)
        {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    useEffect(() =>
    {
        if (!rootRef.current)
            return;

        // rootRef.current.onwheel = (e) =>
        // {
        //     // e.preventDefault();
        //     e.stopPropagation();
        // }
    });

    return (
        <div className={clsx("exhibit-detail", { "visible": props.visible })} ref={rootRef}>
            <main className="img-view">
                {
                    isAlbum
                        ? <div className="page-left">
                            <IconButton icon={<Icons.ChevronLeft />} ></IconButton>
                        </div>
                        : null
                }
                {
                    imgUrl
                        ? <FreeViewport className="img-viewport" ref={viewportRef} minScale={0.1} maxScale={20} scaleRate={1.1}>
                            <img src={imgUrl} alt="" className="img" draggable={false} ></img>
                        </FreeViewport>
                        : null
                }
                {
                    isAlbum
                        ? <div className="page-right">
                            <IconButton icon={<Icons.ChevronRight />}></IconButton>
                        </div>
                        : null
                }
                <IconButton className="button-close" icon={<Icons.Close />} onClick={props.onClose} />
            </main>
            <aside className={clsx("side-pane", { "visible": showProps })}>
                <div className="button-hide-props-padding">
                    <IconButton className="button-hide-props" icon={showProps ? <Icons.ChevronRight /> : <Icons.ChevronLeft />} onClick={() => setShowProps(!showProps)} />
                </div>
                <div className="exhibit-props">
                    <div className="exhibit-data">
                        <Form prototype={ExhibitMetaPrototype} readOnly value={properties}></Form>
                        <LargeLikeButton pid={props.pid} />
                    </div>
                    <CommentSystem cid={props.pid} />
                </div>
            </aside>
        </div>
    );
}

function parseMeta(exhibit: GalleryExhibit, meta: PhotoMeta): DataValue<typeof ExhibitMetaPrototype>
{
    return {
        title: exhibit.title,
        description: exhibit.description,
        aperture: meta.aperture,
        camera: meta.camera,
        focusLength: meta.focusLength,
        height: meta.height,
        width: meta.width,
        iso: meta.iso,
        shutter: decodeShutterSpeed(meta.shutter),
        location: meta.location,
        time: meta.time,
    }
}