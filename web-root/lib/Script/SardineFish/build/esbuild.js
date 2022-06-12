const esbuild = require("esbuild");

esbuild.buildSync({
    entryPoints: ["./SardineFish.API.ts"],
    outdir: "./dist",
    bundle: true,
    format: "iife",
    platform: "browser",
});

esbuild.buildSync({
    entryPoints: ["./SardineFish.API.ts"],
    outdir: "./dist/esm",
    bundle: true,
    format: "esm",
    platform: "browser",
});