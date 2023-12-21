import esbuild from "esbuild";
import alias from "esbuild-plugin-alias";
import { HTMLPlugin } from "./html-plugin.mjs";
import path from "path";
import { sassPlugin } from 'esbuild-sass-plugin';

/**@type {esbuild.BuildOptions} */
export const Option = {
    entryPoints: [
        "src/page/index.tsx",
        "src/page/editor.tsx",
    ],
    bundle: true,
    outdir: "./dist/js",
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
        ".woff2": "file",
        ".woff": "file",
    }
}