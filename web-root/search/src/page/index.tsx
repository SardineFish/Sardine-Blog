import React from "react";
import ReactDOM from "react-dom";
import { SearchPage } from "../view/search";
import "../style/index.scss";
import { SelectGroup } from "../component/select-group";
import { Footer } from "../component/footer";

function App()
{
    return (<>
        <nav className="top-nav">
            <SelectGroup>
                <SelectGroup.Item id="home"><a href="/">HOME</a></SelectGroup.Item>
                <SelectGroup.Item id="blog"><a href="/blog/">BLOG</a></SelectGroup.Item>
                <SelectGroup.Item id="note"><a href="/note/">NOTES</a></SelectGroup.Item>
                <SelectGroup.Item id="lab"><a href="https://lab.sardinefish.com/">LAB</a></SelectGroup.Item>
                <SelectGroup.Item id="github"><a href="https://github.com/SardineFish">GITHUB</a></SelectGroup.Item>
                <SelectGroup.Item id="about"><a href="/about/">ABOUT</a></SelectGroup.Item>
            </SelectGroup>
        </nav>
        <main className="page-content">
            <SearchPage/>
        </main>
    </>);
}

ReactDOM.render(<App />, document.querySelector("#root"));