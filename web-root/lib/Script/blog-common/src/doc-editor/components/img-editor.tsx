import clsx from "clsx";
import React, { ChangeEvent, useRef, useState, MutableRefObject, } from "react";
import { Icons } from "../../misc";
import { FieldEditorProps, FieldEditorRef } from "./doc-editor";
import * as SardineFish from "sardinefish";
import { message } from "../../component";

export function ImageEditor(props: FieldEditorProps<"img">)
{
    const [imgUrl, setImgUrl] = useState<string>("");

    const hasImage = imgUrl !== "";
    const [isProgress, setInProgress] = useState(false);

    const ref = useRef<HTMLInputElement>(null);

    if (props.handle)
    {
        (props.handle as MutableRefObject<FieldEditorRef<"img">>).current = {
            getValue: () => imgUrl || "",
            setValue: (value) => setImgUrl(value),
            clear: () => setImgUrl("")
        };
    }

    const clickUpload = () =>
    {
        if (!ref.current || isProgress)
            return;
        
        ref.current.click();
    };

    const imgLoaded = () =>
    {
        setInProgress(false);
    };

    const fileChanged = async (e: ChangeEvent<HTMLInputElement>) =>
    {
        if (isProgress)
            return;
        try
        {
            if (e.target.files && e.target.files[0])
            {
                const file = e.target.files[0];
                setInProgress(true);

                const info = await SardineFish.API.Storage.getUploadInfo({}, {});
                const formData = new FormData();
                formData.append("token", info.token);
                formData.append("key", info.key);
                formData.append("file", file);
                const result = await SardineFish.API.Utils.requestProgress(info.upload, {
                    method: "POST",
                    body: formData,
                }).then(r => r.json());
                const url = `https://img.sardinefish.com/${result.key}`;
                message.success("Image uploaded");

                setImgUrl(url);
                props.onChanged?.(url);
            }
        }
        catch (err: any)
        {
            message.error(err.message);
        }
    };



    return (<div className={clsx("img-editor", props.descriptor.className, { "empty": !hasImage, "progress": isProgress })}>
        <div className="upload-panel" onClick={clickUpload}>
            {
                isProgress
                    ? <Icons.DotsCircle />
                    : <Icons.Upload />
            }
            <input type={"file"} hidden ref={ref} accept="image/*" onChange={fileChanged} />
        </div>
        <div className="img-panel">
            {
                hasImage
                    ? <img src={imgUrl} onLoad={imgLoaded} />
                    : <ImagePlaceHolder placeHolder={props.descriptor.placeholder} />
            }
        </div>
    </div>);
}

function ImagePlaceHolder(props: { placeHolder?: string })
{
    return <div className="placeholder">
        <Icons.ImageArea />
        <p className="text">{props.placeHolder}</p>
    </div>
}