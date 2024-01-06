import clsx from "clsx";
import React, { SyntheticEvent, useState } from "react";
import { ExhibitMeta, GalleryExhibit, PubPostData, API } from "sardinefish";

export interface PhotoMeta extends Record<string, ExhibitMeta>
{
    type: "Photo",
    width: number,
    height: number,
    camera: string,
    aperture: number,
    shutter: number,
    iso: number,
    focusLength: number,
    time: string,
    location: [number, number],
}

export interface AlbumMeta extends Record<string, ExhibitMeta>
{
    type: "Album",
    width: number,
    height: number,
    count: number,
    album: GalleryExhibit<PhotoMeta>[],
}

const TileHeight = 240;
const AdjustRate = 0.25;

export function Exhibit(props: { exhibit: PubPostData<GalleryExhibit>, onClick: () => void })
{
    let meta = props.exhibit.content.meta as Partial<PhotoMeta>;
    let width = meta.width || 600;
    let height = meta.height || 400;
    let aspectRatio = width / height;
    let maxWidth: number | undefined = undefined;
    let minWidth: number | undefined = undefined;
    const url = API.Storage.processImg(props.exhibit.content.url, "Size600");
    const [loading, setLoading] = useState(true);

    const onLoad = (e: SyntheticEvent<HTMLImageElement>) =>
    {
        setLoading(false);
    };

    if (width > height)
    {
        minWidth = TileHeight * aspectRatio * (1 - AdjustRate);
        maxWidth = TileHeight * aspectRatio * (1 + AdjustRate);
    }
    else if (width < height)
    {
        // portrait can only be fatter
        minWidth = TileHeight * aspectRatio;
        maxWidth = TileHeight * aspectRatio * (1 + AdjustRate);
    }
    else
    {
        minWidth = maxWidth = TileHeight * aspectRatio;
    }

    return (
        <li className={clsx("exhibit-item", { "loading": loading })} onClick={props.onClick} style={{ minWidth, maxWidth, height: TileHeight }}>
            <img className="cover" src={url} onLoad={onLoad}></img>
        </li>
    );
}