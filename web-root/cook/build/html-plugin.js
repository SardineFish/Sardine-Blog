
const esbuild = require("esbuild");
const fs = require("fs");
const { promisify } = require("util");
const { parse, HTMLElement, Node } = require("node-html-parser");
const path = require("path");

const FILE_PATTEN = /\.html$/;

/** @typedef {{outDir: String}} HTMLPluginOption */

/** @type {(option: HTMLPluginOption) => esbuild.Plugin} */
const HTMLPlugin = (option) => ({
    name: "HTMLPlugin",
    setup(build)
    {
        build.onResolve({ filter: FILE_PATTEN }, async (args) =>
        {
            return {
                path: path.join(args.resolveDir, args.path),
                pluginData: {
                    importer: args.importer,
                }
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

module.exports = HTMLPlugin;