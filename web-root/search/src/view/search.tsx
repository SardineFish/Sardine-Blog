import React, { useEffect, useState } from "react";
import { SelectGroup } from "../component/select-group";
import { SearchBar } from "../component/search-bar";
import SardineFishAPI, { SearchHitInfo, SearchResult } from "sardinefish/SardineFish.API";
import { buildQueryString, parseQueryString } from "../misc/utils";
import { useHistory } from "../misc/use-history";
import InfiniteScroller from "react-infinite-scroller";
import { SearchHitInfoBlock } from "../component/result-block";
import { useThrottle } from "../misc/throttle";
import clsx from "clsx";

interface UrlQuery extends Record<string, string | number>
{
    q: string,
}

const PER_PAGE_COUNT = 10;

export function SearchPage()
{
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [hits, setHits] = useState<SearchHitInfo[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const searchThrottle = useThrottle(1);

    const [url, navigate] = useHistory(() =>
    {
        console.log("pop state");
        setLoading(false);
        setHasMore(true);
        setSearchResult(null);
        setHits([]);
    });

    const queryObj = parseQueryString<UrlQuery>(url.search, { q: ""});

    const search = searchThrottle(() => SardineFishAPI.Search.search({ q: queryObj.q, skip: hits?.length ?? 0, count: PER_PAGE_COUNT }));

    const loadMore = async () =>
    {
        setLoading(true);
        const results = await search();
        setSearchResult(results);
        setHits([...hits, ...results.results]);
        if (results.results.length <= 0)
            setHasMore(false);
        setLoading(false);
    }
    const onSearch = async (query: string) =>
    {
        navigate(`${buildQueryString<UrlQuery>({
            q: query,
        })}`);
    };

    return (<>
        <SearchBar className={clsx({"empty": !queryObj.q})} query={queryObj.q} onSearch={onSearch} />
        <main className="results-container">
            <InfiniteScroller loadMore={loadMore} hasMore={!isLoading && hasMore} initialLoad>
                {hits?.map((hitInfo, idx) => (<SearchHitInfoBlock hitInfo={hitInfo} key={idx}/>))}
            </InfiniteScroller>
        </main>
    </>);
}