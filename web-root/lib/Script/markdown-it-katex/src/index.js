import markdownitKatex from "markdown-it-katex";
import katex from "katex";

window.markdownitKatex = (md, option) => markdownitKatex(md, option, katex);

export default markdownitKatex;