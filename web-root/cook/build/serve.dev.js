const BaseOption = require("./build.base");
const esbuild = require('esbuild');
const http = require('http');
const browserSync = require("browser-sync");

const HOST = "localhost";
const PORT = 3000;
const ServeFolder = /^\/cook\//;

const bs = browserSync.create();

bs.init({
    proxy: "127.0.0.1:3000",
    port: "8080"
});

esbuild.build({
    ...BaseOption,
    sourcemap: "linked",
    sourceRoot: "..",
    watch: {
        onRebuild: (err, result) =>
        {
            bs.reload();
        }
    },
});