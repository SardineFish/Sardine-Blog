
import esbuild from "esbuild";
import fs from "fs";
import { promisify } from "util";
import { parse, HTMLElement, Node } from "node-html-parser"
import path from "path";
// const { parse, HTMLElement, Node } = require("node-html-parser");
// const path = require("path");

const FILE_PATTEN = /\.html$/;

/** @typedef {{outDir: String}} HTMLPluginOption */

/** @type {(option: HTMLPluginOption) => esbuild.Plugin} */
export const HTMLPlugin = (option) => ({
    name: "HTMLPlugin",
    setup(build)
    {
        build.onResolve({ filter: FILE_PATTEN }, async (args) =>
        {
            return {
                // Use namespace to create copy of the imported data.
                // To avoid onLoad being called only once.
                namespace: path.basename(args.importer),
                path: path.join(args.resolveDir, args.path),
                pluginData: {
                    importer: args.importer,
                },
                sideEffects: true,
            }
        })
        build.onLoad({ filter: FILE_PATTEN }, async (args) =>
        {
            const baseName = path.parse(args.pluginData.importer).name;
            const scriptName = path.join(build.initialOptions.outdir, `${baseName}.js`);
            const styleName = path.join(build.initialOptions.outdir, `${baseName}.css`);
            const htmlName = path.join(option.outDir, `${baseName}.html`);
            const relativeScriptSrc = path.relative(option.outDir, scriptName).replace(/\\/g, '/');
            const relativeStyleSrc = path.relative(option.outDir, styleName).replace(/\\/g, '/');


            const html = await fs.promises.readFile(args.path, 'utf-8');
            const root = parse(html);
            root.querySelector("body").appendChild(new HTMLElement("script", {}, `src="${relativeScriptSrc}"`));
            root.querySelector("body").appendChild(new HTMLElement("link", {}, `rel="stylesheet" href="${relativeStyleSrc}"`));
            await fs.promises.writeFile(htmlName, root.toString());
            console.info(`HTML saved to ${htmlName} with script ${scriptName}`)
            return {
                contents: root.toString(),
                loader: "file",
            }
        });
    }
});
