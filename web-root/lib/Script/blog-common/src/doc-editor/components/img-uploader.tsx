import clsx from "clsx";
import React, { ChangeEvent, useRef, useState } from "react";
import { DocumentEvent, FoldMenu, message } from "../../component";
import { Icons } from "../../misc";
import * as SardineFish from "sardinefish";

interface Props
{
}

export function ImageUploader(props: Props)
{
    const [imgUrl, setImgUrl] = useState("");
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const ref = useRef<HTMLInputElement>(null);

    const upload = async (file: File) =>
    {
        try
        {
            setIsUploading(true);

            const info = await SardineFish.API.Storage.getUploadInfo({}, {});
            const formData = new FormData();
            formData.append("token", info.token);
            formData.append("key", info.key);
            formData.append("file", file);
            const result = await SardineFish.API.Utils.requestProgress(info.upload, {
                method: "POST",
                body: formData,
                onUploadProgress: (bytes, progress) =>
                {
                    setProgress(progress);
                }
            }).then(r => r.json());
            const url = `https://img.sardinefish.com/${result.key}`;
            message.success("Image uploaded");

            setImgUrl(url);
            setIsUploading(false);
        }
        catch (err: any)
        {
            message.error(err.message);
        }
    }

    const fileChanged = async (e: ChangeEvent<HTMLInputElement>) =>
    {
        if (isUploading)
            return;
        if (e.target.files && e.target.files[0])
        {
            upload(e.target.files[0]);
        }
    };

    const clickUpload = () =>
    {
        if (!ref.current || isUploading)
            return;
        ref.current.click();
    };

    const onPaste = (e: ClipboardEvent) =>
    {
        if (!e.clipboardData)
            return;
        console.log("paste", e.clipboardData.files[0]);
        if (e.clipboardData.files.length === 1)
        {
            upload(e.clipboardData.files[0]);
        }
    }

    return (<div
        className={clsx("img-uploader", { "progress": isUploading, "has-img": imgUrl !== "" })}
    >
        <DocumentEvent event="paste" listener={onPaste} />
        <div className="panel">
            <div className="img-wrapper" onClick={clickUpload}>
                {imgUrl ? <img src={SardineFish.API.Storage.processImg(imgUrl, "Size600")} alt="" className="img"/> : null}
                <div className="placeholder">
                    <Icons.Upload/>
                </div>
            </div>
            
            {imgUrl
                ? <div className="addr-panel">
                    <pre className="link">{imgUrl}</pre>
                    <pre className="html-code">{`<img alt="" src="${imgUrl}">`}</pre>
                    <pre className="md-code">{`![](${imgUrl})`}</pre>
                </div>
                : null
            }
        </div>
        <div className="progress-bar">
            <div className="bar" style={{ width: progress * 100 + "%" }}></div>
        </div>

        <input type={"file"} hidden ref={ref} accept="image/*" onChange={fileChanged} />
    </div>);
}

export function FoldedImgUploader()
{
    const header = (<header className="header">
        <Icons.ChevronRightL />
        <span className="title">Image Uploader</span>
    </header>);
    return (<FoldMenu className="fold-img-uploader" icon={header}>
        <ImageUploader />
    </FoldMenu>)
}