const BaseOption = require("./build.base");
const esbuild = require('esbuild');
const http = require('http');

const HOST = "localhost";
const PORT = 3000;
const ServeFolder = /^\/cook\//;

esbuild.serve({
    servedir: "./dist"
}, {
    ...BaseOption
}).then(result =>
{
    const { host, port } = result

    // Then start a proxy server on port 3000
    http.createServer((request, response) =>
    {
        const isServedFile = ServeFolder.test(request.url);

        const options = isServedFile
            ? {
                hostname: host,
                port: port,
                path: request.url.replace(ServeFolder, "/"),
                method: request.method,
                headers: request.headers,
            } : {
                hostname: "localhost",
                port: 3000,
                path: request.url,
                method: request.method,
                headers: request.headers,
            };

        console.info(`${request.method} ${request.url} -> ${options.hostname}:${options.port} ${request.url}`);

        // Forward each incoming request to esbuild
        const proxyReq = http.request(options, proxyRes =>
        {
            // Forward the response from esbuild to the client
            response.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(response, { end: true });
        });

        // Forward the body of the request to esbuild
        request.pipe(proxyReq, { end: true });
    }).listen(8080);
})