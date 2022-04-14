import webpack from "webpack";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import devServer from "webpack-dev-server";

/**
 * @type {webpack.Configuration}
 */
const config = {
    // mode:"production",
    entry: {
        index: "./src/page/index",
    },
    output: {
        path: path.resolve("./dist"),
        filename: "static/script/[name].js",
        publicPath: "/search",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "react": path.resolve('./node_modules/react'),
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "static/fonts",
                            publicPath: "/search/static/fonts"
                        }
                    }
                ],
            }
        ],
    },
    mode: "development",
    devtool: "eval-source-map",
    /** @type {devServer.Configuration} */
    devServer: {
        static: {
            directory: './dist',
        },
        open: false,
        host: "0.0.0.0",
        port: 5000,
        proxy: {
            "**": {
                target: "http://localhost:3000",
                bypass: (req, res, proxyOptions) =>
                {
                    if (/^\/search\/static/.test(req.url))
                    {
                        return req.url.replace(/^\/search\/static/, "/static");
                    }
                    if (/^\/search/.test(req.url))
                    {
                        return "/index.html";
                    }
                },
            },
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "src/page/index.html",
            inject: true,
            minify: true,
            chunks: ["index"],
        }),
    ]
};

export default config;