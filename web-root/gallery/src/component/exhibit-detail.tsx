import { CommentSystem, DataValue, Form, IconButton, Icons, LargeLikeButton, message, useHistory } from "blog-common";
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
    const [loading, setLoading] = useState(true);
    const imgRef = React.useRef<HTMLImageElement>(null);
    const viewportRef = React.useRef<FreeViewport>(null);
    const [dark, setDark] = useState(false);

    const isAlbum = (data?.content.meta.type) === "Album";

    const [url, pushHistory, goBack] = useHistory();

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

    useEffect(() =>
    {
        if (imgRef.current?.complete)
        {
            setLoading(false);
        }
        else
        {
            setLoading(true);
        }

    }, [imgIdx]);

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

    const imgLoaded = () =>
    {
        setLoading(false);
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

    const nextPage = (offset: number) =>
    {
        if (isAlbum)
        {
            let album = data.content.meta.album as GalleryExhibit<PhotoMeta>[];
            setImgIx((imgIdx + album.length + offset) % album.length);
        }
    };

    const resetTransform = () =>
    {
        viewportRef.current?.reset(.3);
    };

    const { title: _1, description: _2, ...detailsPrototype } = ExhibitMetaPrototype;

    return (
        <div className={clsx("exhibit-detail", { "visible": props.visible, "dark": dark })} ref={rootRef}>
            <main className={clsx("img-view", { "loading": loading })}>
                {
                    isAlbum
                        ? <div className="page-left" onClick={() => nextPage(-1)}>
                            <IconButton icon={<Icons.ChevronLeft />} ></IconButton>
                        </div>
                        : null
                }
                {
                    imgUrl
                        ? <FreeViewport className="img-viewport" ref={viewportRef} minScale={0.1} maxScale={20} scaleRate={1.1}>
                            <img src={imgUrl} alt="" ref={imgRef} className="img" draggable={false} onLoad={imgLoaded}></img>
                        </FreeViewport>
                        : null
                }
                {
                    isAlbum
                        ? <div className="page-right" onClick={() => nextPage(1)}>
                            <IconButton icon={<Icons.ChevronRight />}></IconButton>
                        </div>
                        : null
                }
                <div className="buttons">
                    <IconButton className="button-reset-transform" icon={<Icons.MagnifyScan />} onClick={resetTransform} />
                    <IconButton className="button-dark" icon={dark ? <Icons.LightBulbOnOutline /> : <Icons.LightBulbOutline />} onClick={() => setDark(!dark)} />
                    <IconButton className="button-close" icon={<Icons.Close />} onClick={props.onClose} />
                </div>
            </main>
            <aside className={clsx("side-pane", { "visible": showProps })}>
                <div className="button-hide-props-padding">
                    <IconButton className="button-hide-props" icon={showProps ? <Icons.ChevronRight /> : <Icons.ChevronLeft />} onClick={() => setShowProps(!showProps)} />
                </div>
                <div className="exhibit-props">
                    <div className="exhibit-data">
                        <header className="title">
                            <span className="title-text">{data?.content.title}</span>
                            <span className={clsx("album-pics", { "visible": isAlbum })}>{data?.content.meta.album?.length}</span>
                        </header>
                        <div className="description">{data?.content.description}</div>
                        <Form prototype={detailsPrototype} readOnly value={properties}></Form>
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