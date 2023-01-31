import React, { useEffect, useRef, useState } from "react";
import SimpleMDE from "simplemde";
import { SelectGroup } from "../../component";
import { error } from "../../misc";
import markdownit from "markdown-it";
import markdownitEmoji from "markdown-it-emoji";
// @ts-ignore
import markdownitKatex from "@iktakahiro/markdown-it-katex";
import katex from "katex";
import * as SardineFish from "sardinefish";
const markdownitKatexWrap = (md, option) => markdownitKatex(md, option, katex);
var EditMode;
(function (EditMode) {
    EditMode["Preview"] = "preview";
    EditMode["Code"] = "code";
    EditMode["Markdown"] = "markdown";
})(EditMode || (EditMode = {}));
window.react1 = React;
export function MarkdownEditor(props) {
    let ref = useRef(null);
    const [editMode, setEditMode] = useState(EditMode.Preview);
    const [editor, setEditor] = useState(null);
    useEffect(() => {
        if (!ref.current)
            return;
        if (!editor) {
            const md = markdownit({
                html: true,
                xhtmlOut: false,
                breaks: true,
                langPrefix: 'lang-',
                linkify: true,
                typographer: false,
            });
            md.use(markdownitEmoji);
            md.use(markdownitKatexWrap);
            md.use(mdImgPostprocess);
            let previousDoc = "";
            let delayTimeout = -1;
            const editor = new SimpleMDE({
                element: ref.current,
                initialValue: "",
                toolbar: false,
                spellChecker: false,
                // previewRender: (text, preview) =>
                // {
                //     if (text == previousDoc)
                //         return undefined;
                //     previousDoc = text;
                //     if (preview)
                //     {
                //         clearTimeout(delayTimeout);
                //         delayTimeout = setTimeout(() =>
                //         {
                //             // previousRenderResult = md.render(text);
                //             preview.innerHTML = md.render(text);
                //         }, 100);
                //         return "rendering...";
                //     }
                //     else 
                //         return md.render(text);
                // }
            });
            setTimeout(() => {
                editor.toggleSideBySide();
            }, 100);
            setEditor(editor);
        }
    }, []);
    if (props.handle) {
        props.handle.current = {
            getDoc: () => {
                return editor?.value() ?? error("uninitialized ref");
            },
            clear: () => editor?.value(""),
            setDoc: (value) => editor?.value(value),
        };
    }
    return (React.createElement("div", { className: "md-editor" },
        React.createElement("header", { className: "tool-bar" },
            React.createElement(SelectGroup, { className: "select-edit-mode", selectedKey: editMode, onSelectChange: setEditMode },
                React.createElement(SelectGroup.Item, { id: EditMode.Code }, "Code"),
                React.createElement(SelectGroup.Item, { id: EditMode.Preview }, "Preview"),
                React.createElement(SelectGroup.Item, { id: EditMode.Markdown }, "Markdown"))),
        React.createElement("main", { className: "md-input markdown-body" },
            React.createElement("textarea", { ref: ref }))));
}
function imagePostProcess(imgUrl) {
    const src = imgUrl;
    imgUrl = SardineFish.API.Storage.processImg(imgUrl, "Size600");
    console.log(`${src} -> ${imgUrl}`);
    return imgUrl;
}
function mdImgPostprocess(md) {
    const imgProcess = md.renderer.rules.image;
    const htmlBlockProcess = md.renderer.rules.html_block;
    const htmlInlineProcess = md.renderer.rules.html_inline;
    md.renderer.rules.image = function (tokens, idx, options, env, slf) {
        var token = tokens[idx];
        if (token.attrs) {
            var imgUrl = token.attrs[token.attrIndex('src')][1];
            imgUrl = imagePostProcess(imgUrl);
            //imgUrl = defaultImageHost.replace(webArchivePrefixReplacer, imgUrl);
            console.log(`${token.attrs[token.attrIndex('src')][1]} -> ${imgUrl}`);
            token.attrs[token.attrIndex('src')][1] = imgUrl;
        }
        let result = imgProcess(tokens, idx, options, env, slf);
        if (token.attrGet("alt")) {
            result += `<aside class="img-note">${token.attrGet("alt")}</aside>`;
        }
        return result;
    };
    const handleHTML = (token) => {
        const html = token.content;
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        for (const img of Array.from(wrapper.querySelectorAll("img"))) {
            img.src = imagePostProcess(img.src);
        }
        createImgNoteForImgGroup(wrapper);
        // console.log(wrapper.innerHTML);
        token.content = wrapper.innerHTML;
    };
    md.renderer.rules.html_block = (tokens, idx, options, env, slf) => {
        var token = tokens[idx];
        handleHTML(token);
        return htmlBlockProcess(tokens, idx, options, env, slf);
    };
    md.renderer.rules.html_inline = (tokens, idx, options, env, slf) => {
        var token = tokens[idx];
        handleHTML(token);
        return htmlInlineProcess(tokens, idx, options, env, slf);
    };
}
function createImgNoteForImgGroup(wrapper) {
    const group = wrapper.querySelector(".img-row");
    const imgs = group.querySelectorAll("img");
    if (imgs.length === 0)
        return;
    const notes = Array.from(imgs).map(img => {
        const element = document.createElement("aside");
        element.innerText = img.alt;
        element.classList.add("img-note");
        return element;
    });
    const noteElement = document.createElement("aside");
    noteElement.classList.add("img-row-note");
    notes.forEach(node => noteElement.appendChild(node));
    group.insertAdjacentElement("afterend", noteElement);
}
//# sourceMappingURL=md-editor.js.map