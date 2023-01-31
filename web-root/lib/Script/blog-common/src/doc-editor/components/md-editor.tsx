import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import SimpleMDE from "simplemde";
import { SelectGroup } from "../../component";
import { error } from "../../misc";
import markdownit from "markdown-it";
import markdownitEmoji from "markdown-it-emoji";
// @ts-ignore
import markdownitKatex from "@iktakahiro/markdown-it-katex";
import katex from "katex";
import MarkdownIt from "markdown-it";
import { RenderRule } from "markdown-it/lib/renderer";
import Token from "markdown-it/lib/token";
import * as SardineFish from "sardinefish";

const markdownitKatexWrap = (md: any, option: any) => markdownitKatex(md, option, katex);

export interface MarkdownEditorRef {
    getDoc(): string,
    setDoc(doc: string): void,
    clear(): void,
}

enum EditMode
{
    Preview="preview",
    Code="code",
    Markdown="markdown",
}

(window as any).react1 = React;

export function MarkdownEditor(props: {handle?: MutableRefObject<MarkdownEditorRef|undefined>})
{
    let ref = useRef<HTMLTextAreaElement>(null);
    const [editMode, setEditMode] = useState(EditMode.Preview);
    const [editor, setEditor] = useState<SimpleMDE | null>(null);

    useEffect(() =>
    {
        if (!ref.current)
            return;
        
        if (!editor)
        {
            const md = markdownit({
                html: true, // Enable HTML tags in source
                xhtmlOut: false, // Use '/' to close single tags (<br />).
                breaks: true, // Convert '\n' in paragraphs into <br>
                langPrefix: 'lang-', // CSS language prefix for fenced blocks. Can be
                linkify: true, // Autoconvert URL-like text to links
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
            setTimeout(() =>
            {
                editor.toggleSideBySide();

            }, 100);
            setEditor(editor);
        }
    }, []);

    if (props.handle)
    {
        props.handle.current= {
            getDoc: () =>
            {
                return editor?.value() ?? error("uninitialized ref");
            },
            clear: () => editor?.value(""),
            setDoc: (value) => editor?.value(value),
        }
    }

    return (<div className="md-editor">
        <header className="tool-bar">
            <SelectGroup className="select-edit-mode" selectedKey={editMode} onSelectChange={setEditMode}>
                <SelectGroup.Item id={EditMode.Code}>Code</SelectGroup.Item>
                <SelectGroup.Item id={EditMode.Preview}>Preview</SelectGroup.Item>
                <SelectGroup.Item id={EditMode.Markdown}>Markdown</SelectGroup.Item>
            </SelectGroup>
        </header>
        <main className="md-input markdown-body">
            <textarea ref={ref}></textarea>
        </main>
    </div>)
}

function imagePostProcess(imgUrl: string)
{
    const src = imgUrl;

    imgUrl = SardineFish.API.Storage.processImg(imgUrl, "Size600");

    console.log(`${src} -> ${imgUrl}`);

    return imgUrl;
}

function mdImgPostprocess(md: MarkdownIt)
{
    const imgProcess = md.renderer.rules.image;
    const htmlBlockProcess = md.renderer.rules.html_block;
    const htmlInlineProcess = md.renderer.rules.html_inline;

    md.renderer.rules.image = function (tokens, idx, options, env, slf)
    {
        var token = tokens[idx];
        if (token.attrs)
        {
            var imgUrl = token.attrs[token.attrIndex('src')][1];
            imgUrl = imagePostProcess(imgUrl);

            //imgUrl = defaultImageHost.replace(webArchivePrefixReplacer, imgUrl);
            console.log(`${token.attrs[token.attrIndex('src')][1]} -> ${imgUrl}`);
            token.attrs[token.attrIndex('src')][1] = imgUrl;
        }
        let result = (imgProcess as RenderRule)(tokens, idx, options, env, slf) 
        if (token.attrGet("alt"))
        {
            result += `<aside class="img-note">${token.attrGet("alt")}</aside>`;
        }

        return result;
    };

    const handleHTML = (token: Token) =>
    {
        const html = token.content;
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        for (const img of Array.from(wrapper.querySelectorAll("img")))
        {
            img.src = imagePostProcess(img.src);
        }
        createImgNoteForImgGroup(wrapper);
        // console.log(wrapper.innerHTML);
        token.content = wrapper.innerHTML;
    }

    md.renderer.rules.html_block = (tokens, idx, options, env, slf) =>
    {
        var token = tokens[idx];
        handleHTML(token);
        return (htmlBlockProcess as RenderRule)(tokens, idx, options, env, slf);
    };

    md.renderer.rules.html_inline = (tokens, idx, options, env, slf) =>
    {
        var token = tokens[idx];
        handleHTML(token);
        return (htmlInlineProcess as RenderRule)(tokens, idx, options, env, slf);
    }
}

function createImgNoteForImgGroup(wrapper: HTMLDivElement)
{
    const group = wrapper.querySelector(".img-row") as HTMLDivElement;
    const imgs = group.querySelectorAll("img");
    if (imgs.length === 0)
        return;
    const notes = Array.from(imgs).map(img =>
    {
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