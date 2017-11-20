const { resolve } = require('path')
const webpack = require('webpack')
const { merge } = require('lodash')

const __approot = resolve(__dirname, '../')
const __helpers = resolve(__approot, 'helpers/')
const __lib = resolve(__approot, 'lib/')
const __globals = resolve(__approot, 'globals/')

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
			'event-loop': resolve(__globals, 'event-loop')
		},

    modules: [
			__lib,
			__helpers,
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
			'_named': resolve(__globals, 'namedFunc'),
	    'extend': [resolve(__globals, 'extend'), 'extend'],
			'_extend': [resolve(__globals, 'extend'), '_extend'],
			'defProp': [resolve(__globals, 'def.js'), 'defProp'],
			'Buffer': resolve(__globals, 'buffer'),
			'process': resolve(__globals, 'process'),
			'setImmediate': [resolve(__globals, 'event-loop'), 'setImmediate']
		})
	]
}
