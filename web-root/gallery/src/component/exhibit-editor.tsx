import { Button, DataPrototype, DataValue, Form, IconButton, Icons, Progress, SelectGroup, message, timeout } from "blog-common";
import React, { useState, useRef, useEffect } from "react";
import EXIF from "exif-js";
import ExifReader from 'exifreader';
import { API, GalleryExhibit } from "sardinefish";
import { AlbumMeta, PhotoMeta } from "./exhibit";
import { decodeShutterSpeed, encodeShutterSpeed, parseExifRational } from "../utils";

export const ExhibitMetaPrototype = DataPrototype({
    title: "string",
    description: "string",
    time: "string",
    camera: "string",
    width: "number",
    height: "number",
    focusLength: "number",
    iso: "number",
    aperture: "number",
    shutter: "string",
    location: "location",
});

interface EditingImage
{
    file: File,
    url: string,
    exif: ExifReader.ExifTags,
    meta: PhotoMeta,

}

export function ExhibitEditor(props: { pid?: number })
{
    const [imgs, setImgs] = useState<EditingImage[]>([]);
    const [editingIdx, setEditing] = useState(0);
    const [exhibitInfo, setExhibit] = useState<GalleryExhibit>({
        title: "",
        description: "",
        url: "",
        meta: {} as any
    });

    const fileInput = useRef<HTMLInputElement>(null);
    const uploader = useRef<Uploader>(null);


    const upload = () =>
    {
        if (!fileInput.current)
            return;

        fileInput.current.click();

    }

    const onChanged = async (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        if (e.target.files && uploader.current)
        {
            const files: File[] = [];
            const exifList: ExifReader.ExpandedTags[] = [];
            for (let i = 0; i < e.target.files.length; ++i)
            {
                files.push(e.target.files[i]);

                exifList[i] = await ExifReader.load(files[0], {
                    expanded: true,
                });
                console.log(exifList[i]);
            }
            const urlList = await uploader.current.upload(files);
            setImgs([...imgs, ...files.map((file, idx) => ({
                file,
                url: urlList[idx],
                exif: exifList[idx],
                meta: metaFromExif(exifList[idx]),
            }))]);
        }
    }

    const selectImg = (idx: number) =>
    {
        setEditing(idx);
    }

    const editing = editingIdx < imgs.length ? imgs[editingIdx] : null;

    const formData: DataValue<typeof ExhibitMetaPrototype> = {
        title: exhibitInfo.title,
        description: exhibitInfo.description,
        aperture: editing?.meta.aperture || 0,
        focusLength: editing?.meta.focusLength || 0,
        iso: editing?.meta.iso || 0,
        shutter: decodeShutterSpeed(editing?.meta.shutter || 0),
        location: editing?.meta.location || [0, 0],
        time: editing?.meta.time || "",
        width: editing?.meta.width || 0,
        height: editing?.meta.height || 0,
        camera: editing?.meta.camera || "",
    };

    const formDataChanged = (newData: DataValue<typeof ExhibitMetaPrototype>) =>
    {
        exhibitInfo.title = newData.title;
        exhibitInfo.description = newData.description;

        if (editing)
        {
            editing.meta.aperture = newData.aperture;
            editing.meta.shutter = encodeShutterSpeed(newData.shutter);
            editing.meta.iso = newData.iso;
            editing.meta.focusLength = newData.focusLength;
            editing.meta.location = [...newData.location];
            editing.meta.camera = newData.camera;
            editing.meta.time = newData.time;
        }
    }

    const post = async () =>
    {
        console.log("Start posting exhibit");
        try
        {
            if (imgs.length === 0)
            {
                message.error("No photo in exhibit");
                return;
            }
            let exhibit: GalleryExhibit<PhotoMeta> | GalleryExhibit<AlbumMeta>;

            if (imgs.length === 1)
            {
                exhibit = {
                    title: exhibitInfo.title,
                    description: exhibitInfo.description,
                    url: imgs[0].url,
                    meta: imgs[0].meta
                };
            }
            else
            {
                if (!editing)
                {
                    message.error("No cover selected");
                    return;
                }

                exhibit = {
                    title: exhibitInfo.title,
                    description: exhibitInfo.description,
                    url: editing.url,
                    meta: {
                        type: "Album",
                        count: imgs.length,
                        width: editing.meta.width,
                        height: editing.meta.height,
                        album: imgs.map(img => ({
                            title: exhibitInfo.title,
                            description: exhibitInfo.description,
                            url: img.url,
                            meta: img.meta
                        }))
                    }
                };
            }


            if (props.pid)
            {
                console.log(`Update existed exhibit pid ${props.pid}`);
                const result = await API.Gallery.update({ pid: props.pid }, exhibit);
                message.success(`Updated exhibit pid ${result}`);
                await timeout(2000);
                location.assign("/gallery/");
            }
            else
            {
                console.log(`Post new exhibit`);
                const result = await API.Gallery.post({}, exhibit);
                message.success(`Posted new exhibit as pid ${result}`);
                await timeout(2000);
                location.assign("/gallery/");
            }
        }
        catch (err)
        {
            message.error((err as Error).message)
        }
    };

    return (
        <div className="exhibit-editor">
            <div className="image-pane">
                <div className="large-view">
                    {
                        editing
                            ? <img className="current-img" src={editing.url}></img>
                            : <div className="placeholder" onClick={upload}>
                                <Icons.Upload />
                            </div>
                    }
                </div>
                <div className="upload-progress">
                    <Uploader ref={uploader} />
                </div>
                <div className="img-list">
                    <SelectGroup className="img-select-group" selectedKey={editingIdx} onSelectChange={selectImg}>
                        {imgs.map((img, idx) => (<SelectGroup.Item id={idx} key={idx}>
                            <img className="img-thumbail" src={API.Storage.processImg(img.url, "Width600")}></img>
                        </SelectGroup.Item>))}
                    </SelectGroup>
                </div>
            </div>
            <aside className="props-editor">
                <Form prototype={ExhibitMetaPrototype} value={formData} onChanged={formDataChanged} />

                <div className="img-op">
                    <Button className="button-upload" onClick={upload}>Upload</Button>
                    <IconButton className="button-delete" icon={<Icons.DeleteForever />} />
                    <input hidden type="file" multiple ref={fileInput} onChange={onChanged}></input>
                </div>

                <Button className="button-post" onClick={post}>Post</Button>
            </aside>
        </div>
    )

}

function metaFromExif(exif: ExifReader.ExpandedTags): PhotoMeta
{
    const fNumber = exif.exif?.FNumber as ExifReader.RationalTag | undefined;
    let shutterValues = (exif.exif?.ShutterSpeedValue as ExifReader.RationalTag | undefined)?.value ?? [0, 1];
    let inverseShutterSpeed = shutterValues[0] / shutterValues[1];
    let shutterSpeed: number;
    if (!exif.exif?.ShutterSpeedValue)
        shutterSpeed = 0;
    else if (inverseShutterSpeed > 0)
        shutterSpeed = -Math.round(Math.pow(2, inverseShutterSpeed));
    else if (inverseShutterSpeed <= 0)
        shutterSpeed = Math.round(Math.pow(2, -inverseShutterSpeed));
    else
        shutterSpeed = 0;


    return {
        type: "Photo",
        width: exif.file?.["Image Width"]?.value ?? 0,
        height: exif.file?.["Image Height"]?.value ?? 0,
        aperture: (fNumber?.value[0] ?? 0) / (fNumber?.value[1] ?? 1),
        camera: (exif.exif?.Make?.description ?? "") + " " + (exif.exif?.Model?.description ?? ""),
        shutter: shutterSpeed,
        focusLength: parseExifRational(exif.exif?.FocalLength as any, 0),
        iso: exif.exif?.ISOSpeedRatings?.value ?? 0,
        time: exif.exif?.DateTimeOriginal?.description ?? "",
        location: [exif.gps?.Latitude || 0, exif.gps?.Longitude || 0],
    };
}

interface UploaderRef
{
    upload: (files: File[]) => Promise<string[]>,
}

class DelayTask<Output extends any>
{
    constructor(task: () => Promise<Output>)
    {
        this.promise = new Promise((resolve, reject) =>
        {
            this.resolve = resolve;
            this.reject = reject;
        });
        this.task = task;
    }

    promise: Promise<Output>;
    task: () => Promise<Output>;
    private resolve?: (url: Output) => void;
    private reject?: (err: any) => void;

    run()
    {
        this.task().then(output => this.resolve?.(output)).catch(err => this.reject?.(err));
    }
}

interface UploaderState
{
    totalTask: number,
    progress: number,
    taskQueue: DelayTask<string>[],
    uploading: boolean,
}
class Uploader extends React.Component<{}, UploaderState>
{
    constructor(props: {})
    {
        super(props);

        this.state = {
            totalTask: 0,
            progress: 0,
            taskQueue: [],
            uploading: false
        };
    }

    async upload(files: File[])
    {
        console.log(`Uploading ${files.length} files`);
        const tasks = files.map(file => new DelayTask(async () =>
        {
            const info = await API.Storage.getUploadInfo({}, {});
            const formData = new FormData();
            formData.append("token", info.token);
            formData.append("key", info.key);
            formData.append("file", file);
            const result = await API.Utils.requestProgress(info.upload, {
                method: "POST",
                body: formData,
                onUploadProgress: (bytes, total) =>
                {
                    this.updateSingleProgress(bytes / total);
                }
            }).then(r => r.json());
            const url = `https://img.sardinefish.com/${result.key}`;
            console.log("Uploaded one image");
            this.onComplete();

            return url;
        }));

        this.setState({
            taskQueue: [...this.state.taskQueue, ...tasks],
            totalTask: this.state.totalTask + tasks.length
        });

        return Promise.all(tasks.map(task => task.promise));
    }

    private updateSingleProgress(progress: number)
    {
        const taskProgress = ((this.state.totalTask - this.state.taskQueue.length - 1) / this.state.totalTask);
        const singleProgress = progress / this.state.totalTask;
        console.log("progress", taskProgress, singleProgress);
        this.setState({ progress: taskProgress + singleProgress });
    }

    private onComplete()
    {
        if (this.state.taskQueue.length === 0)
        {
            this.setState({
                totalTask: 0,
                progress: 1,
                uploading: false,
            });
        }
        else
        {
            console.log("Starting next task");
            const [task, ...rest] = this.state.taskQueue;
            this.setState({
                taskQueue: rest,
                uploading: true
            });
            task.run();
        }
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<UploaderState>, snapshot?: any): void
    {
        if (!this.state.uploading && this.state.taskQueue.length > 0)
        {
            console.log("Start uploading tasks");
            this.onComplete();
        }
    }

    render(): React.ReactNode
    {
        return (<Progress fraction={this.state.progress} />)
    }
}

// function Uploader(props: { uploaderRef: React.RefObject<UploaderRef> })
// {
//     const [totalTask, setTotalTask] = useState(0);
//     const [progress, setProgress] = useState(0);
//     const [taskQueue, setTaskQueue] = useState<DelayTask<string>[]>([]);
//     const [uploading, setUploading] = useState(false);

//     const updateSingleProgress = (progress: number) =>
//     {
//         const taskProgress = ((totalTask - taskQueue.length - 1) / taskQueue.length);
//         const singleProgress = progress / totalTask;
//         setProgress(taskProgress + singleProgress);
//     };

//     const onComplete = () =>
//     {
//         if (taskQueue.length === 0)
//         {
//             setTotalTask(0);
//             setProgress(1);
//             setUploading(false);
//         }
//         else
//         {
//             console.log("Starting next task");
//             const [task, ...rest] = taskQueue;
//             setTaskQueue(rest);
//             task.run();
//             setUploading(true);
//         }
//     }

//     useEffect(() =>
//     {
//         if (!uploading && taskQueue.length > 0)
//         {
//             console.log("Start uploading tasks");
//             onComplete();
//         }
//     }, [taskQueue]);

//     useEffect(() =>
//     {
//         (props.uploaderRef as React.MutableRefObject<UploaderRef>).current = {
//             upload: async (files) =>
//             {
//                 console.log(`Uploading ${files.length} files`);
//                 const tasks = files.map(file => new DelayTask(async () =>
//                 {
//                     const info = await API.Storage.getUploadInfo({}, {});
//                     const formData = new FormData();
//                     formData.append("token", info.token);
//                     formData.append("key", info.key);
//                     formData.append("file", file);
//                     const result = await API.Utils.requestProgress(info.upload, {
//                         method: "POST",
//                         body: formData,
//                         onUploadProgress: (bytes, progress) =>
//                         {
//                             updateSingleProgress(progress);
//                         }
//                     }).then(r => r.json());
//                     const url = `https://img.sardinefish.com/${result.key}`;
//                     console.log("Uploaded one image");
//                     onComplete();

//                     return url;
//                 }));

//                 setTaskQueue([...taskQueue, ...tasks]);
//                 setTotalTask(totalTask + tasks.length);

//                 return Promise.all(tasks.map(task => task.promise));
//             }
//         }
//     }, [props.uploaderRef]);



//     return (<Progress fraction={progress} />)
// }