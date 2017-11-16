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
					plugins: [
		        'external-helpers',
		        ['transform-object-rest-spread', { loose: true }],
		        ['check-es2015-constants', { loose: true }],
		        ['transform-es2015-arrow-functions', { loose: true }],
		        ['transform-es2015-block-scoped-functions', { loose: true }],
		        ['transform-es2015-block-scoping', { loose: true }],
		        ['transform-es2015-classes', { loose: true }],
		        ['transform-es2015-computed-properties', { loose: true }],
		        ['transform-es2015-destructuring', { loose: true }],
		        ['transform-es2015-duplicate-keys', { loose: true }],
		        ['transform-es2015-for-of', { loose: true }],
		        ['transform-es2015-function-name', { loose: true }],
		        ['transform-es2015-literals', { loose: true }],
		        ['transform-es2015-object-super', { loose: true }],
		        ['transform-es2015-parameters', { loose: true }],
		        ['transform-es2015-shorthand-properties', { loose: true }],
		        ['transform-es2015-spread', { loose: true }],
		        ['transform-es2015-sticky-regex', { loose: true }],
		        ['transform-es2015-template-literals', { loose: true }],
		        ['transform-es2015-typeof-symbol', { loose: true }],
		        ['transform-es2015-unicode-regex', { loose: true }],
		        ['transform-regenerator', { loose: true }]
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
