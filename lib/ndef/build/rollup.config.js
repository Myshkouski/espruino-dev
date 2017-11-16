import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import yaml from 'rollup-plugin-yaml'
import analyze from 'rollup-analyzer-plugin'

const __approot =path.resolve(__dirname, '../')
const __src = path.resolve(__approot, 'src/')
const __dist = path.resolve(__approot, 'dist/')



const bundles = []

bundles.push({
  input: path.resolve(__src, 'ndef.js'),
  output: {
    file: path.resolve(__dist, 'index.js'),
    format: 'cjs'
  },
  plugins: [
    yaml(),

    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [
        ['es2015', { modules: false }]
      ],
      plugins: [
        'external-helpers'/*,
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
        ['transform-regenerator', { loose: true }]*/
      ]
    }),

    resolve({
      jsnext: true,
      main: true,
      jail: __approot,
      preferBuiltins: false
    }),

    commonjs({
      include: /.+/
    })
  ]
})

// es6
bundles.push({
  input: path.resolve(__src, 'ndef.js'),
  output: {
    file: path.resolve(__dist, 'index.es6.js'),
    format: 'es'
  },
  plugins: [
    yaml()
  ]
})

// minified
bundles.push({
  input: path.resolve(__src, 'ndef.js'),
  output: {
    file: path.resolve(__dist, 'index.min.js'),
    format: 'cjs'
  },
  plugins: [
    yaml(),

    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [
        ['es2015', { modules: false }]
      ],
      plugins: [
        'external-helpers'/*,
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
        ['transform-regenerator', { loose: true }]*/
      ]
    }),

    resolve({
      jsnext: true,
      main: true,
      jail: __approot,
      preferBuiltins: false
    }),

    commonjs({
      include: /.+/
    }),

    uglify({
      sourceMap: true,
      toplevel: true
    }),

    analyze({
      limit: 5,
      root: __approot
    })
  ]
})

export default bundles
