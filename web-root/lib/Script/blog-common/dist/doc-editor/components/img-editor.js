import clsx from "clsx";
import React, { useRef, useState, } from "react";
import { Icons } from "../../misc";
import * as SardineFish from "sardinefish";
import { message } from "../../component";
export function ImageEditor(props) {
    const [imgUrl, setImgUrl] = useState("");
    const hasImage = imgUrl !== "";
    const [isProgress, setInProgress] = useState(false);
    const ref = useRef(null);
    if (props.handle) {
        props.handle.current = {
            getValue: () => imgUrl || "",
            setValue: (value) => setImgUrl(value),
            clear: () => setImgUrl("")
        };
    }
    const clickUpload = () => {
        if (!ref.current || isProgress)
            return;
        ref.current.click();
    };
    const imgLoaded = () => {
        setInProgress(false);
    };
    const fileChanged = async (e) => {
        if (isProgress)
            return;
        try {
            if (e.target.files && e.target.files[0]) {
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
        catch (err) {
            message.error(err.message);
        }
    };
    return (React.createElement("div", { className: clsx("img-editor", props.descriptor.className, { "empty": !hasImage, "progress": isProgress }) },
        React.createElement("div", { className: "upload-panel", onClick: clickUpload },
            isProgress
                ? React.createElement(Icons.DotsCircle, null)
                : React.createElement(Icons.Upload, null),
            React.createElement("input", { type: "file", hidden: true, ref: ref, accept: "image/*", onChange: fileChanged })),
        React.createElement("div", { className: "img-panel" }, hasImage
            ? React.createElement("img", { src: imgUrl, onLoad: imgLoaded })
            : React.createElement(ImagePlaceHolder, { placeHolder: props.descriptor.placeholder }))));
}
function ImagePlaceHolder(props) {
    return React.createElement("div", { className: "placeholder" },
        React.createElement(Icons.ImageArea, null),
        React.createElement("p", { className: "text" }, props.placeHolder));
}
//# sourceMappingURL=img-editor.js.map