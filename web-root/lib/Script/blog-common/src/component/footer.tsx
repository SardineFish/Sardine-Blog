import React from "react";

export function Footer()
{
    return (<footer className="page-footer">
        <p>POWERED BY SardineFish</p>
        <p>Copyright © 2015-<span>{new Date().getFullYear()}</span></p>
    </footer>)
}