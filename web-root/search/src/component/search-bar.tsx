import clsx from "clsx";
import React, { FormEvent, useState } from "react";
import { Icons } from "../misc/icons";

interface SearchBarProps
{
    className?: string,
    query?: string,
    onSearch?: (query: string) => void,
    placeholder?: string,
}

export function SearchBar(props: SearchBarProps)
{
    const [query, setQuery] = useState(props.query || "");

    const search = () =>
    {
        props.onSearch?.(query);
    };
    const sbumit = (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        search();
    }

    const placeholder = props.placeholder || "Search";

    return (<form className={clsx("search-bar", props.className)} onSubmit={sbumit}>
        <input
            type="search"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
        />
        <input type="submit" style={{ display: "none" }}></input>
        <Icons.Magnify className="icon button search-commit" onClick={search} />
        <div className="background"></div>
    </form>)
}