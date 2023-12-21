const { defineConfig } = require("vite");
const { resolve } = require("path");

console.log(resolve("./"));

module.exports = defineConfig({
    root: "./src/pages",
    base: "",
    build: {
        rollupOptions: {
            input: {
                editor: resolve("./src/pages/editor.html"),
                index: "./src/pages/index.html",
            }
        },
        outDir: resolve("./dist"),
    },
    server: {
        proxy: {
            "/api/": "http://127.0.0.1:3000/api/",
        },
        base: "/dist/",
        fs: {
            strict: false,
        }
    },
})