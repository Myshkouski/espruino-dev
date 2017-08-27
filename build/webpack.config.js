const { resolve } = require('path')
const webpack = require('webpack')
const { merge } = require('lodash')

const __approot = resolve(__dirname, '../')

const sharedConfig = {
	node: {
		console: false,
		global: false,
		__filename: false,
		__dirname: false,
		setImmediate: false
	},

	devtool: 'sourcemap',

	entry: {
		index: resolve(__approot, 'src/index')
	},

	output: {
		path: resolve(__approot, 'bundle/')
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
						['es2015', { loose: true }]
					],
					plugins: [
						//modules
						"add-module-exports",

						//syntax
						"transform-object-rest-spread"
					]
				}
			}
		]
	},

	plugins: [

	]
}

const espruinoBundleConfig = merge({
	//target: 'node',
	node: {
		Buffer: false,
		process: false
	},

	output: {
		filename: '[name].esp.js'
	},

	resolve: {
		alias: {
			'events': resolve(__approot, 'lib/events'),
			'stream': resolve(__approot, 'lib/stream'),
			'buffer': resolve(__approot, 'lib/buffer')
		}
	}
}, sharedConfig)

espruinoBundleConfig.plugins.push(new webpack.ProvidePlugin({
	'alive': resolve(__approot, 'lib/alive'),
	'extend': resolve(__approot, 'lib/extend'),
	'Buffer': resolve(__approot, 'lib/buffer'),
	'process': resolve(__approot, 'lib/process'),
	'setImmediate': resolve(__approot, 'lib/setImmediate')
}))

espruinoBundleConfig.plugins.push(new webpack.optimize.UglifyJsPlugin())



const nodeBundleConfig = merge({
	target: 'node',

	node: {
		Buffer: false,
		process: false
	},

	output: {
		filename: '[name].node.js'
	}
}, sharedConfig)

module.exports = [ espruinoBundleConfig, nodeBundleConfig ]
