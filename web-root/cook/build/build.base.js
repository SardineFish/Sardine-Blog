const esbuild = require("esbuild");
const HTMLPlugin = require("./html-plugin");

/**@type {esbuild.BuildOptions} */
const Option = {
    entryPoints: ["src/pages/index.tsx"],
    bundle: true,
    outdir: "./dist/js",
    watch: process.argv.indexOf("-w") >= 0,
    plugins: [HTMLPlugin({ outDir: "./dist" })]
}

module.exports = Option;