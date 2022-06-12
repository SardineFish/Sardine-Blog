const esbuild = require("esbuild");
const alias = require("esbuild-plugin-alias");
const HTMLPlugin = require("./html-plugin");
const path = require("path");
const { sassPlugin } = require('esbuild-sass-plugin');

/**@type {esbuild.BuildOptions} */
const Option = {
    entryPoints: ["src/pages/index.tsx", "src/pages/editor.tsx"],
    bundle: true,
    outdir: "./dist/js",
    watch: process.argv.indexOf("-w") >= 0,
    plugins: [
        HTMLPlugin({ outDir: "./dist" }),
        alias({
            "react": path.resolve('./node_modules/react/index.js'),
            "react-dom": path.resolve("./node_modules/react-dom/index.js"),
        }),
        sassPlugin({
            type: "css",
            cssImports: true,
        })
    ],
    loader: {
        ".ttf": "file",
    }
}

module.exports = Option;