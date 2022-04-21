import React from "react";
import { createRoot } from "react-dom/client";
import "./base.html";
import { Footer, NavMenu } from "blog-common";
import "../style/index.scss";

function App()
{
    return (<>
        <NavMenu className="top-nav" />
        <main>

        </main>
        <Footer />
    </>);
}

const root = createRoot(document.body);
root.render(<App />);