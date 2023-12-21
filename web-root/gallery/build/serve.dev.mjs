import { Option as BaseOption } from "./build.base.mjs";
import esbuild from "esbuild";
import http from "http";

const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = 3000;
const ServeFolder = /^\/cook\//;

// const bs = browserSync.create();

// bs.init({
//     proxy: "127.0.0.1:3000",
//     port: "8080"
// });


// await ctx.watch({
// })

// esbuild.build({
//     ...BaseOption,
//     sourcemap: "linked",
//     sourceRoot: "..",
//     watch: {
//         onRebuild: (err, result) =>
//         {
//             bs.reload();
//         }
//     },
// });

const ctx = await esbuild.context({
    ...BaseOption,
    sourcemap: "inline",
    sourceRoot: "..",
});

await ctx.watch();

const { host, port } = await ctx.serve({ servedir: './dist' });

function pipeToEsBuild(req, res)
{
    const options = {
        hostname: host,
        port: port,
        path: req.url.replace("/gallery", ""),
        method: req.method,
        headers: req.headers,
    }

    if (/\/gallery\/\d+/.test(req.url))
    {
        options.path = "/index.html";
    }

    // Forward each incoming request to esbuild
    const proxyReq = http.request(options, proxyRes =>
    {
        // If esbuild returns "not found", send a custom 404 page
        if (proxyRes.statusCode === 404)
        {
            res.writeHead(404, { 'Content-Type': 'text/html' })
            res.end('<h1>A custom 404 page</h1>')
            return
        }

        // Otherwise, forward the response from esbuild to the client
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        proxyRes.pipe(res, { end: true })
    })

    req.pipe(proxyReq);

}

function proxyToServer(req, res)
{
    const options = {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers,
    }

    // Forward each incoming request to esbuild
    const proxyReq = http.request(options, proxyRes =>
    {
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        proxyRes.pipe(res, { end: true })
    })

    req.pipe(proxyReq, { end: true });
}

http.createServer((req, res) =>
{
    if (req.url.startsWith("/gallery"))
    {
        pipeToEsBuild(req, res);
    }
    else
    {
        proxyToServer(req, res);
    }
}).listen(8080);