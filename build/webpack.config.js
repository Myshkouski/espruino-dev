const { resolve } = require('path')
const webpack = require('webpack')
const { merge } = require('lodash')

const __approot = resolve(__dirname, '../')
const __lib = resolve(__approot, 'lib')

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

	resolve: {
		alias: {
			'bus': resolve(__lib, 'bus')
		}
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
		filename: '[name].esp.webpack.js'
	},

	resolve: {
		alias: {
			'events': resolve(__lib, 'events'),
			'stream': resolve(__lib, 'stream'),
			'buffer': resolve(__lib, 'buffer')
		}
	}
}, sharedConfig)

espruinoBundleConfig.plugins.push(new webpack.ProvidePlugin({
	'alive': resolve(__lib, 'alive'),
	'extend': [resolve(__lib, 'extend'), 'extend'],
	'_extend': [resolve(__lib, 'extend'), '_extend'],
	'defProp': [resolve(__lib, 'def.js'), 'defProp'],
	'Buffer': resolve(__lib, 'buffer'),
	'process': resolve(__lib, 'process'),
	'setImmediate': resolve(__lib, 'setImmediate')
}))

espruinoBundleConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
	mangle: {
		keep_fnames: true
	}
}))



const nodeBundleConfig = merge({
	target: 'node',

	node: {
		Buffer: false,
		process: false
	},

	output: {
		filename: '[name].node.webpack.js'
	}
}, sharedConfig)

module.exports = [ espruinoBundleConfig, nodeBundleConfig ]
