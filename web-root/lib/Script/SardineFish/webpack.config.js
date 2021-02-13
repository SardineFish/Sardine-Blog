const webpack = require('webpack');
const path = require('path');

/**
 * @type {webpack.Configuration}
 */
module.exports = {
    // mode:"production",
    entry: {
        ["SardineFish.API"]: "./SardineFish.API",
    },
    output: {
        path: path.resolve(__dirname),
        filename: "[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
        ]
    },
    mode: "development",
    devtool: false,
};