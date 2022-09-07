import { Icons } from "blog-common";
import clsx from "clsx";
import React, { useContext, useRef, useState } from "react";
import { RecipePreviewContent, PubPostData } from "sardinefish";
import * as SardineFish from "sardinefish";
import { RecipeContext } from "./recipe-details";

export function RecipePreview(props: { recipe: PubPostData<RecipePreviewContent> })
{
    const [visible, setVisible] = useState(true);
    const context = useContext(RecipeContext);
    const ref = useRef<HTMLAnchorElement>(null);

    const click = (e: React.MouseEvent<HTMLAnchorElement>) =>
    {
        if (!ref.current)
            return;
        e.preventDefault();
        // history.pushState(null, "", `/cook/${props.recipe.pid}`);
        setVisible(false);
        (async () =>
        {
            if (!ref.current)
                return;
            await context.showDetails(props.recipe.pid, true, ref.current.getBoundingClientRect());
            setVisible(true);
        })();
    };

    return (<a
        className={clsx("recipe-preview", { "visible": visible, "hidden": !visible })}
        href={`/cook/${props.recipe.pid}`} onClick={click}
        ref={ref}
    >
        <div className="image-wrapper">
            {
                props.recipe.content.images[0]
                    ? <img src={SardineFish.API.Storage.processImg(props.recipe.content.images[0], "Width600")} alt="cook image" />
                    : <div className="placeholder">
                        <Icons.ForkKnife />
                    </div>
            }

        </div>
        <div className="info">
            <header className="title">{props.recipe.content.title}</header>
            <aside className="description">{props.recipe.content.description}</aside>
            <MaterialTags type="requirements" tags={props.recipe.content.requirements} />
            <MaterialTags type="optional" tags={props.recipe.content.optional} />
        </div>
    </a>)
}

export function MaterialTags(props: { type: string, tags: string[] })
{
    return (<ul className={clsx("tags", props.type)}>
        {props.tags.map((item, idx) => (<li className="item" key={idx}>{item}</li>))}
    </ul>)
}