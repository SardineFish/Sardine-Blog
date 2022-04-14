const esbuild = require("esbuild");
const alias = require("esbuild-plugin-alias");
const HTMLPlugin = require("./html-plugin");
const path = require("path");

/**@type {esbuild.BuildOptions} */
const Option = {
    entryPoints: ["src/pages/index.tsx"],
    bundle: true,
    outdir: "./dist/js",
    watch: process.argv.indexOf("-w") >= 0,
    plugins: [
        HTMLPlugin({ outDir: "./dist" }),
        alias({
            "react": path.resolve('./node_modules/react/index.js'),
        })
    ],
}

module.exports = Option;