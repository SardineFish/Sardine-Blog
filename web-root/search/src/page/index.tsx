import React from "react";
import ReactDOM from "react-dom";
import { SearchPage } from "../view/search";

function App()
{
    return (<SearchPage />);
}

ReactDOM.render(<App />, document.querySelector("#root"));