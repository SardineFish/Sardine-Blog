import React from "react";
import ReactDOM from "react-dom";
import "../assets/css/index.scss";

function App()
{
    return (
        <p>Hello World.</p>
    );
}

ReactDOM.render((<App />), document.querySelector("#root"));