import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "",
  root: "./html",
  build: {
    outDir: resolve(__dirname, "dist"),
    rollupOptions: {
      input: {
        index: resolve(__dirname, "html/index.html"),
        view: resolve(__dirname, "html/view.html"),
        editor: resolve(__dirname, "html/editor.html"),
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": "http://127.0.0.1:3000/",
      "/": "http://127.0.0.1:3000/"
    },
    base: "/blog"
  }
})
