import esbuild from "esbuild";
import { Option } from "./build.base.mjs";

await esbuild.build({
    ...Option,
    minify: true
});