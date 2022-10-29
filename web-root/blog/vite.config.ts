import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "",
  // root: "./html",
  resolve: {
    alias: {
      "font": resolve(__dirname, "node_modules/font"),
      "simplemde": resolve(__dirname, "node_modules/simplemde")
    }
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        view: resolve(__dirname, "view.html"),
        editor: resolve(__dirname, "editor.html"),
      }
    },
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/": "http://127.0.0.1:3000/"
    },
    base: "/blog",
    fs: {
      allow: [".."]
    }
  }
})
