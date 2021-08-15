import React from "react";
import ReactDOM from "react-dom";
import { SearchPage } from "../view/search";
import "../style/index.scss";
import { SelectGroup } from "../component/select-group";
import { Footer } from "../component/footer";
import { NavMenu } from "../component/nav-menu";

function App()
{
    return (<>
        <NavMenu className="top-nav"/>
        <main className="page-content">
            <SearchPage/>
        </main>
    </>);
}

ReactDOM.render(<App />, document.querySelector("#root"));