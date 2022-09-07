import { IconButton, Icons, match, message, useHistory, WindowEvent } from "blog-common";
import clsx from "clsx";
import React, { TouchEvent, UIEvent, useContext, useEffect, useRef, useState } from "react";
import { APIError, PubPostData, RecipeContent, API } from "sardinefish";
import { MaterialTags } from "./recipe-preview";
import { marked } from "marked";

export function RecipeDetailsManager()
{
    const context = useContext(RecipeContext);
    const [pid, setPid] = useState<number>();
    const [previewRect, setPreviewRect] = useState<DOMRect>();
    const [resolver, setResolver] = useState<() => void>();
    const [depth, setDepth] = useState(0);
    const [url] = useHistory();
    const show = pid !== undefined;



    context.showDetails = (pid: number, pushHistory: boolean, previewRect?: DOMRect) =>
    {
        if (pushHistory)
        {
            history.pushState(null, "", `/cook/${pid}`);
            setDepth(depth + 1);
        }
        return new Promise((resolve =>
        {
            if (!resolver)
            {
                setResolver(() => resolve);
                setPreviewRect(previewRect);
            }
            setPid(pid);
        }));
    };

    useEffect(() =>
    {
        const paths = url.pathname.split("/");
        const pidPath = paths.pop();
        if (pidPath && !isNaN(pidPath as any as number))
        {
            setTimeout(() =>
            {
                context.showDetails(Number(pidPath), false);
            }, 100);
        }
        else
        {
            setPid(undefined);
        }
    }, [url]);

    const onClosed = () =>
    {
        resolver?.();
        setResolver(undefined);
        setPid(undefined);
    };

    const requestClose = () =>
    {
        if (depth === 0)
        {
            history.pushState(null, "", "/cook/");
            setDepth(depth + 1);
        }
        else
        {
            history.back();
            setDepth(depth - 1);
        }
    };

    const rect = previewRect || new DOMRect(document.body.clientWidth / 2, 0, 0, 0);

    return (<RecipeDetails show={show} pid={pid || -1} onFullyClosed={onClosed} previewRect={rect} onCloseRequest={requestClose} />)
}

export const RecipeContext = React.createContext({
    async showDetails(pid: number, pushHistory: Boolean, previewRect?: DOMRect) { }
});

function RecipeDetails(props: { show: boolean, pid: number, previewRect: DOMRect, onFullyClosed: () => void, onCloseRequest: () => void })
{
    const [data, setData] = useState<PubPostData<RecipeContent>>();
    const [state, setState] = useState<"showing" | "present" | "hiding" | "invisible">("invisible");
    const [rect, setRect] = useState<DOMRect>(new DOMRect());
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() =>
    {
        if (!containerRef.current)
            return;

        if (props.show)
        {
            if (state === "invisible")
            {
                setRect(props.previewRect);
                const targetRect = containerRef.current.getBoundingClientRect();
                setTimeout(() =>
                {
                    setState("showing");
                    setRect(targetRect);
                }, 33);
            }

            setData(undefined);
            (async () =>
            {

                try
                {
                    const data = await SardineFish.API.Cook.get({ pid: props.pid });
                    setData(data);
                }
                catch (err)
                {
                    message.error(`Failed to fetch recipe: ${(err as APIError).message}`);
                }
            })();


        }
        else if (state === "present")
        {
            close();
        }
    }, [props.show, props.pid]);

    useEffect(() =>
    {
        switch (state)
        {
            case "showing":
                setTimeout(() =>
                {
                    setState("present");
                }, 300);
            case "present":
                document.body.style.overflow = "hidden";
                break;
            default:
                document.body.style.overflow = "";
        }
    }, [state]);

    const close = () =>
    {
        setState("hiding");
        setRect(props.previewRect);
        setTimeout(() =>
        {
            setState("invisible");
            props.onFullyClosed();
        }, 200);
    }

    const clickClose = () =>
    {
        props.onCloseRequest();
    };

    const onWindowResize = () =>
    {
        if (!containerRef.current)
            return;
        const targetRect = containerRef.current.getBoundingClientRect();
        if (state === "present" || state == "showing")
        {
            setRect(targetRect);
        }
    };

    return (<div className={clsx("recipe-details", state)} onClick={clickClose}>
        <div className="background"></div>
        <div className="details-container" ref={containerRef}></div>{
            data
                ? <RecipeDetailsPanel data={data} rect={rect} limitHeight={state !== "present"} />
                : null
        }
        <WindowEvent event="resize" listener={onWindowResize} />
    </div>)
}

function RecipeDetailsPanel(props: { data: PubPostData<RecipeContent>, rect: DOMRect, limitHeight: boolean })
{
    const contentRef = useRef<HTMLDivElement>(null);

    const clickPanel = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        e.stopPropagation();
    }

    const data = props.data;
    const rect = props.rect;

    useEffect(() =>
    {

        marked.parse(props.data.content.content, (err, result) =>
        {
            if (err)
                message.error(`Failed to parse content: ${err}`);
            if (!contentRef.current)
                return;
            contentRef.current.innerHTML = result;
        });

    }, [props.data]);

    let style: React.CSSProperties = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
    };
    if (props.limitHeight)
        style.height = rect.height;

    return (
        <div className="scroller" style={style}>
            <main
                className="details-panel"
                onClick={clickPanel}
            >
                <IconButton className="button-close" icon={<Icons.Close />} />
                <div className="image-wrapper">
                    {
                        data.content.images[0]
                            ? <img src={API.Storage.processImg(data.content.images[0], "Width1000")} alt="cook image" />
                            : <div className="placeholder">
                                <Icons.ForkKnife />
                            </div>
                    }


                    <header className="header">
                        <span className="title">{data.content.title}</span>
                        <span className="by">by </span>
                        <a className="author" href={data.author.url || ""}>{data.author.name}</a>
                    </header>

                </div>
                <div className="info">
                    <a href={`/cook/editor.html?pid=${props.data.pid}`} className="button-edit button icon-button">
                        <Icons.Pencil />
                    </a>
                    <div className="description">{data.content.description}</div>
                    <MaterialTags type="requirements" tags={data.content.requirements} />
                    <MaterialTags type="optional" tags={data.content.optional} />
                    <div className="divider">
                        <span className="text">Details</span>
                        <hr />
                    </div>
                    <div className="content" ref={contentRef}></div>
                </div>

            </main>
        </div>);
}