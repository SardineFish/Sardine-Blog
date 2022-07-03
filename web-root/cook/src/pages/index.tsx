import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./base.html";
import { Footer, message, NavMenu, Waterfall } from "blog-common";
import "../style/index.scss";
import InfiniteScroller from "react-infinite-scroller";
import { RecipePreview } from "../components/recipe-preview";
import { APIError, PubPostData, RecipePreviewContent } from "sardinefish";
import { RecipeContext, RecipeDetailsManager } from "../components/recipe-details";

function App()
{
    const [data, setData] = useState<PubPostData<RecipePreviewContent>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = async () =>
    { 
        setIsLoading(true);
        try
        {
            var fetchedData = await SardineFish.API.Cook.getList({ from: data.length, count: 10 });
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

    return (
        <RecipeContext.Provider value={{ async showDetails() { } }}>
            <NavMenu className="top-nav" />
            <main className="page-content">
                <InfiniteScroller className="cook-book" loadMore={loadMore} hasMore={!isLoading && hasMore} initialLoad>
                    <Waterfall columns={5}>
                        {
                            data.map((item, idx) => (<RecipePreview recipe={item} key={idx} />))
                        }
                    </Waterfall>
                </InfiniteScroller>
            </main>
            <Footer />
            <RecipeDetailsManager />
        </RecipeContext.Provider>);
}

const root = createRoot(document.querySelector("#root") ?? document.body);
root.render(<App />);