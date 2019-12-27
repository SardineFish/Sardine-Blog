const merge = require("webpack-merge");
const baseConfig = require("./webpack.base.config");

module.exports = merge(
    baseConfig,
    {
        mode: "development",
        output: {
            filename: "[name].js"
        },
        devtool: "source-map",
    }
)