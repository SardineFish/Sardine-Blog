import clsx from "clsx";
import React, { useRef, useState } from "react";
import { DocumentEvent, FoldMenu, message } from "../../component";
import { Icons } from "../../misc";
import * as SardineFish from "sardinefish";
export function ImageUploader(props) {
    const [imgUrl, setImgUrl] = useState("");
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const ref = useRef(null);
    const upload = async (file) => {
        try {
            setIsUploading(true);
            const info = await SardineFish.API.Storage.getUploadInfo({}, {});
            const formData = new FormData();
            formData.append("token", info.token);
            formData.append("key", info.key);
            formData.append("file", file);
            const result = await SardineFish.API.Utils.requestProgress(info.upload, {
                method: "POST",
                body: formData,
                onUploadProgress: (bytes, progress) => {
                    setProgress(progress);
                }
            }).then(r => r.json());
            const url = `https://img.sardinefish.com/${result.key}`;
            message.success("Image uploaded");
            setImgUrl(url);
            setIsUploading(false);
        }
        catch (err) {
            message.error(err.message);
        }
    };
    const fileChanged = async (e) => {
        if (isUploading)
            return;
        if (e.target.files && e.target.files[0]) {
            upload(e.target.files[0]);
        }
    };
    const clickUpload = () => {
        if (!ref.current || isUploading)
            return;
        ref.current.click();
    };
    const onPaste = (e) => {
        if (!e.clipboardData)
            return;
        console.log("paste", e.clipboardData.files[0]);
        if (e.clipboardData.files.length === 1) {
            upload(e.clipboardData.files[0]);
        }
    };
    return (React.createElement("div", { className: clsx("img-uploader", { "progress": isUploading, "has-img": imgUrl !== "" }) },
        React.createElement(DocumentEvent, { event: "paste", listener: onPaste }),
        React.createElement("div", { className: "panel" },
            React.createElement("div", { className: "img-wrapper", onClick: clickUpload },
                imgUrl ? React.createElement("img", { src: SardineFish.API.Storage.processImg(imgUrl, "Size600"), alt: "", className: "img" }) : null,
                React.createElement("div", { className: "placeholder" },
                    React.createElement(Icons.Upload, null))),
            imgUrl
                ? React.createElement("div", { className: "addr-panel" },
                    React.createElement("pre", { className: "link" }, imgUrl),
                    React.createElement("pre", { className: "html-code" }, `<img alt="" src="${imgUrl}">`),
                    React.createElement("pre", { className: "md-code" }, `![](${imgUrl})`))
                : null),
        React.createElement("div", { className: "progress-bar" },
            React.createElement("div", { className: "bar", style: { width: progress * 100 + "%" } })),
        React.createElement("input", { type: "file", hidden: true, ref: ref, accept: "image/*", onChange: fileChanged })));
}
export function FoldedImgUploader() {
    const header = (React.createElement("header", { className: "header" },
        React.createElement(Icons.ChevronRightL, null),
        React.createElement("span", { className: "title" }, "Image Uploader")));
    return (React.createElement(FoldMenu, { className: "fold-img-uploader", icon: header },
        React.createElement(ImageUploader, null)));
}
//# sourceMappingURL=img-uploader.js.map