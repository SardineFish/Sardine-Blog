import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./base.html";
import { BlogNav, Footer, Icons, message, NavMenu, Waterfall, WindowEvent } from "blog-common";
import "../style/index.scss";
import InfiniteScroller from "react-infinite-scroller";
import { RecipePreview } from "../components/recipe-preview";
import { APIError, PubPostData, RecipePreviewContent } from "sardinefish";
import { RecipeContext, RecipeDetailsManager } from "../components/recipe-details";
import { AdminMenu } from "../components/admin-menu";

function responsiveColum()
{
    if (window.innerWidth > 1660)
        return 5;
    if (window.innerWidth > 1400)
        return 4;
    if (window.innerWidth > 1000)
        return 3;
    if (window.innerWidth > 660)
        return 2;
    return 1;
}

function App()
{
    const [data, setData] = useState<PubPostData<RecipePreviewContent>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [columns, setColumns] = useState(responsiveColum());

    const loadMore = async () =>
    {
        if (isLoading)
            return;
        setIsLoading(true);
        try
        {
            var fetchedData = await SardineFish.API.Cook.getList({ from: data.length, count: 30 });
            setData([...data, ...fetchedData]);
            if (fetchedData.length === 0)
                setHasMore(false);
        }
        catch (err)
        {
            message.error(`Failed to fetch data: ${(err as APIError).message}`);
        }
        finally
        {
            setIsLoading(false);
        }
    };

    useEffect(() =>
    {
        loadMore();
    }, []);

    const onWindowResize = () =>
    {
        if (responsiveColum() != columns)
            setColumns(responsiveColum());
    };

    return (
        <RecipeContext.Provider value={{ async showDetails() { } }}>
            <NavMenu className="top-nav" title="SardineFish's Cookbook">
                <BlogNav />
                <AdminMenu />
            </NavMenu>
            <main className="page-content">
                <InfiniteScroller className="cook-book" loadMore={loadMore} hasMore={!isLoading && hasMore} initialLoad>
                    <Waterfall columns={columns}>
                        {
                            data.map((item, idx) => (<RecipePreview recipe={item} key={idx} />))
                        }
                        <a className="create-new" href="/cook/editor.html">
                            <Icons.Plus />
                        </a>
                    </Waterfall>
                </InfiniteScroller>
            </main>
            <Footer />
            <RecipeDetailsManager />
            <WindowEvent event="resize" listener={onWindowResize} />
        </RecipeContext.Provider>);
}

const root = createRoot(document.querySelector("#root") ?? document.body);
root.render(<App />);