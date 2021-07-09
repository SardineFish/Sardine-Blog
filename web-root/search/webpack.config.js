import "webpack";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

/**
 * @type {webpack.Configuration}
 */
export default {
    // mode:"production",
    entry: {
        index: "./src/page/index",
    },
    output: {
        path: path.resolve("./dist"),
        filename: "static/script/[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
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
                            context: "src/assets",
                            outputPath: "static/fonts",
                            publicPath: "dist/static/fonts"
                        }
                    }
                ],
            }
        ]
    },
    mode: "development",
    devtool: "source-map",
    devServer: {
        contentBase: "./dist",
        writeToDisk: false,
        open: false,
        host: "localhost",
        port: 5000,
        proxy: {
            "/api/**": {
                target: "http://localhost:3000/",
            },
            "/search": {
                bypass: () =>
                {
                    return "/index.html";
                }
            }
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