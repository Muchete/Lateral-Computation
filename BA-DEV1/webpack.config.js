const path = require('path');
const webpack = require("webpack");
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
	mode: "development",
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
								loader: "style-loader", 
								options: {
										sourceMap: true
								}
							}, {
								loader: "css-loader", 
								options: {
										sourceMap: true
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
	devServer: {
		contentBase: path.join(__dirname, "/"),
		port: 9500,
		publicPath: "http://localhost:9500/dist/",
		hotOnly: true
	},
	plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 9500,
      proxy: 'http://localhost:9500/'
  })
  ]
};


