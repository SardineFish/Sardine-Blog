import clsx from "clsx";
import React from "react";
// import { SearchHitInfo } from "../../../lib/Script/SardineFish/SardineFish.API";
import { SearchHitInfo } from "sardinefish/SardineFish.API";
import { match, safeEmphasized } from "blog-common";

export function SearchHitInfoBlock(props: { hitInfo: SearchHitInfo })
{
    const info = props.hitInfo;
    const url = match(info.doc_type, {
        "Blog": `/blog/${info.pid}`,
        "Note": `/note/${info.pid}`,
    });
    const rawHighlight = info.highlight.tags?.map(highlight => highlight.replace(/<\/?em>/g, ""));
    
    return (<section className="search-hit">
        <header className="meta-data">
            <h1 className="title">
                {
                    info.highlight.title
                        ? <a className="highlight" href={url} dangerouslySetInnerHTML={safeEmphasized(info.highlight.title)}></a>
                        : <a href={url}>{info.title}</a>
                }
            </h1>
            <div className="info">
                {info.highlight.author
                    ? <a
                        href={`/search?q=${info.author}`}
                        className="author highlight"
                        dangerouslySetInnerHTML={safeEmphasized(info.highlight.author)}
                    />
                    : <a href={`/search?q=${info.author}`} className="author">{info.author}</a>
                }
                <div className="time">{new Date(info.time).toLocaleString()}</div>
                <ul className="tags">
                    {info.tags.map((tag, idx) =>
                    {
                        const hlIdx = rawHighlight?.findIndex(t => t === tag);
                        const highlight = hlIdx !== undefined ? info.highlight.tags?.[hlIdx] : undefined;
                        return highlight
                            ? <a
                                className="tag highlight"
                                href={`/search?q=${tag}`}
                                key={idx}
                                dangerouslySetInnerHTML={safeEmphasized(highlight)}
                            />
                            : <a className="tag" href={`/search?q=${tag}`} key={idx}>{tag}</a>
                    })}
                </ul>
            </div>
        </header>
        <p className={clsx("content", {"highlight": info.highlight.content})}>
            {
                info.highlight.content
                    ? info.highlight.content.map((content, idx) =>
                        (<span key={idx} dangerouslySetInnerHTML={{ __html: content }}></span>))
                    : info.preview
            }
        </p>
    </section>)
}