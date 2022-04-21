import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "./base.html";
import { Footer, NavMenu } from "blog-common";
import "../style/editor.scss";
import SimpleMDE from "simplemde";

function App()
{
    let ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() =>
    {
        if (!ref.current)
            return;
        
        const editor = new SimpleMDE({
            element: ref.current,
            initialValue: ""
        });
        editor.value();
    });

    return (<>
        <NavMenu className="top-nav" />
        <main>
            <textarea className="editor" id="editor" ref={ref}></textarea>
        </main>
        <Footer />
    </>);
}

const root = createRoot(document.body);
root.render(<App />);