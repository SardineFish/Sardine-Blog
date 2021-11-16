const webpack = require('webpack');
const path = require('path');

/**
 * @type {webpack.Configuration}
 */
module.exports = {
    // mode:"production",
    entry: {
        main: "./src/page/index",
    },
    output: {
        path: path.resolve(__dirname, "..", "dist"),
        filename: "[name].js"
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
    }
};