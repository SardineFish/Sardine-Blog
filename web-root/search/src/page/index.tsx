import React from "react";
import ReactDOM from "react-dom";
import { SearchPage } from "../view/search";
import "../style/index.scss";

function App()
{
    return (<SearchPage />);
}

ReactDOM.render(<App />, document.querySelector("#root"));