const { resolve } = require('path')
const webpack = require('webpack')

const espruinoBundleConfig = {
	//target: 'node',
	node: {
		console: false,
		global: false,
		process: false,
		__filename: false,
		__dirname: false,
		Buffer: false,
		setImmediate: false
	},

	devtool: 'sourcemap',

	entry: {
		index: resolve(__dirname, 'src/index')
	},
	
	output: {
		path: resolve(__dirname, 'bundle/'),
		filename: '[name].js'
	},

	resolve: {
		alias: {
			'events': resolve(__dirname, 'lib/events'),
			'stream': resolve(__dirname, 'lib/stream')
		}
	},

	module: {
		rules: [
			{
				test: /\.yml$/,
				loader: 'yaml-loader'
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				options: {
					presets: [
						[ 'es2015', { loose: true } ]
					],
					plugins: [
						//modules
						"add-module-exports",
						"transform-es2015-modules-commonjs",

						//syntax
						"transform-object-rest-spread"
					]
				}
			}
		]
	},

	plugins: [
		new webpack.optimize.UglifyJsPlugin(),
		new webpack.ProvidePlugin({
			'extend': resolve(__dirname, 'lib/extend'),
			'Buffer': resolve(__dirname, 'lib/buffer')
		})
	]
}

module.exports = [ espruinoBundleConfig ]