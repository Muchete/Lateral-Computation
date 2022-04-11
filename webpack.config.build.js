const path = require('path');
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	mode: "production",
	entry: ['./src/css/main.scss', './src/js/index.js'],
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				loader: "babel-loader",
				options: { presets: ["@babel/env"] }
			},
			{
				test: /\.scss$/,
				use: [{
						loader: MiniCssExtractPlugin.loader, 
						options: {
							sourceMap: true	
						}
					}, {
						loader: "css-loader", 
						options: {
							sourceMap: true
						}
					}, {
						loader: "postcss-loader", 
						options: {
								sourceMap: true,
						}
					}, {
						loader: "sass-loader", 
						options: {
							sourceMap: true
						}
					}
				]
			}
		]
	},
	resolve: { extensions: [".js", ".jsx", ".scss", ".css", ".html"] },
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: "/dist/",
	},
	plugins: [
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: "[name].css",
			// chunkFilename: "ids.css"
		}),
		new webpack.SourceMapDevToolPlugin({
			filename: '[name].css.map',
			exclude: ['main.js']
		})
  	]
};


