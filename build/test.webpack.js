const { resolve } = require('path')
const webpack = require('webpack')
const { merge } = require('lodash')

const __approot = resolve(__dirname, '../')
const __helpers = resolve(__approot, 'helpers/')
const __lib = resolve(__approot, 'lib/')
const __polyfill = resolve(__lib, 'polyfill/')

module.exports = {
	node: {
		console: false,
		global: false,
		__filename: false,
		__dirname: false,
		setImmediate: false,
		Buffer: false,
		process: false
	},

	context: __approot,

	resolve: {
    alias: {
			'event-loop': resolve(__polyfill, 'event-loop')
		},

    modules: [
			__lib,
			'node_modules'
    ]
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
					presets: ['env'],
					plugins: [
						//modules
						'add-module-exports',
						'transform-es2015-modules-commonjs',

						//syntax
						'transform-object-rest-spread'
					]
				}
			}
		]
	},

	plugins: [
		new webpack.ProvidePlugin({
			'_named': resolve(__helpers, 'namedFunc'),
	    'extend': [resolve(__lib, 'extend'), 'extend'],
			'_extend': [resolve(__lib, 'extend'), '_extend'],
			'defProp': [resolve(__helpers, 'def.js'), 'defProp'],
			'Buffer': resolve(__lib, 'buffer'),
			'process': resolve(__polyfill, 'process'),
			'setImmediate': [resolve(__polyfill, 'event-loop'), 'setImmediate']
		})
	]
}
