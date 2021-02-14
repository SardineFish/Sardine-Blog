const webpack = require('webpack');
const path = require('path');

module.exports = {
	// mode:"production",
	entry: {
		main: "./src/main",
	},
	devtool: "source-map",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js"
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"]
	},
	module: {
		rules: [{
			test: /\.tsx?$/,
			loader: "ts-loader"
		}]
	}
};