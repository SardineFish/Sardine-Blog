import "./base.html";
import "../style/index.scss";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BlogNav, Footer, NavMenu, message, useHistory } from "blog-common";
import { AdminMenu } from "../component/admin-menu";
import InfiniteScroller from "react-infinite-scroller";
import { APIError, GalleryExhibit, PubPostData } from "sardinefish";
import { Exhibit } from "../component/exhibit";
import { API } from "sardinefish";
import { ExhibitDetail } from "../component/exhibit-detail";

function parseUrl(): number
{
    const reg = /gallery\/(\d+)/;
    const match = reg.exec(window.location.pathname);
    if (match && match[1])
    {
        return Number(match[1]);
    }
    return 0;
}

function App()
{
    const [data, setData] = useState<PubPostData<GalleryExhibit>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [viewPid, setPid] = useState(parseUrl);
    const [canBack, setCanBack] = useState(false);
    const [url, pushHistory, goBack] = useHistory();

    const loadMore = async () =>
    {
        const fetchCount = 32;

        setIsLoading(true);

        try
        {
            const result = await API.Gallery.getList({ from: data.length, count: fetchCount });
            setData([...data, ...result]);
            setHasMore(result.length >= fetchCount);
        }
        catch (err)
        {
            message.error((err as APIError).message);
        }
        finally
        {
            setIsLoading(false);
        }
    }

    if (!isLoading && data.length === 0 && hasMore)
        loadMore();

    useEffect(() =>
    {
        if (parseUrl() !== viewPid)
            setPid(parseUrl());
    }, [url]);

    const openDetail = (pid: number) =>
    {
        setPid(pid);
        setCanBack(true);
        // history.pushState(null, "", `/gallery/${pid}`);
        pushHistory(`/gallery/${pid}`);
    }

    const closeDetail = () =>
    {
        if (canBack)
        {
            goBack();
            setCanBack(false);
        }
        else
        {
            pushHistory("/gallery/");
            // history.pushState(null, "", "/gallery/");
        }
        setPid(0);
    };


    return (<>
        <NavMenu className="top-nav" title="SardineFish Gallery">
            <BlogNav />
            <AdminMenu />
        </NavMenu>
        <main className="page-content">
            <InfiniteScroller className="cook-book" loadMore={loadMore} hasMore={!isLoading && hasMore} initialLoad>
                <ul className="gallery-preview">
                    {
                        data.map((data, idx) => (<Exhibit exhibit={data} key={idx} onClick={() => openDetail(data.pid)} />))
                    }
                </ul>
            </InfiniteScroller>
        </main>
        <ExhibitDetail pid={viewPid} visible={viewPid !== 0} onClose={closeDetail} />
        <Footer />
    </>);
}

const root = createRoot(document.querySelector("#root") ?? document.body);
root.render(<App />);

new EventSource('/gallery/esbuild').addEventListener('change', () => location.reload());