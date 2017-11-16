import path from 'path'
import babel from 'rollup-plugin-babel'
import inject from 'rollup-plugin-inject'
import eslint from 'rollup-plugin-eslint'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import root from 'rollup-plugin-root-import'
import alias from 'rollup-plugin-alias'
import replace from 'rollup-plugin-re'
import uglify from 'rollup-plugin-uglify'
import legacy from 'rollup-plugin-legacy'
import analyze from 'rollup-analyzer-plugin'
import defaults from 'lodash.defaultsdeep'

const __approot = path.resolve(__dirname, '../')
const __lib = path.resolve(__approot, 'lib')
const __helpers = path.resolve(__approot, 'helpers')
const __dist = path.resolve(__approot, 'bundle')
const __src = path.resolve(__approot, 'src')
const input = path.resolve(__src, 'index.js')

const bundlerName = 'rollup'
const targetPlatform = 'esp'

const espPolyfills = {
  //exclude: 'node_modules/**',
  modules: {
    'Object': path.resolve(__lib, 'polyfill/object.js'),
    'Array': path.resolve(__lib, 'polyfill/array.js'),
    //'Promise': path.resolve(__lib, 'polyfill/promise.js'),
    'Buffer': path.resolve(__lib, 'polyfill/buffer/index.js'),
    'process': path.resolve(__lib, 'polyfill/process.js'),
    'console': path.resolve(__lib, 'polyfill/console.js')
  }
}

const injectPolyfillExcludeNM = {
  exclude: 'node_modules/**',
  modules: {
    '_named': path.resolve(__helpers, 'namedFunc.js'),
    '_extend': [path.resolve(__lib, 'extend.js'), '_extend'],
    'extend': [path.resolve(__lib, 'extend.js'), 'extend'],
    'blink': path.resolve(__lib, 'blink.js'),
    'instanceOf': path.resolve(__lib, 'instanceOf.js'),
    'defProp': [path.resolve(__helpers, 'def.js'), 'defProp'],
  }
}

const replaceInstanceOf = {
  patterns: [
    {
      include: __src + '/**',
      exclude: path.resolve(__lib, 'instanceOf.js'),
      test: /(?!\s)([\[\]{}\w.\s+\-*/><]+)[\r\n\t\s]+instanceof[\r\n\t\s]+([\[\]{}\w.\s+\-*/><]+)(?!\s)/ig,
      replace: (...args) => `instanceOf(${ args[1] }, ${ args[2] })`
    }
  ]
}

const injectEventLoopoptions = {
  exclude: path.resolve(__lib, 'event-loop.js') + '/**',
  modules: {
    'setTimeout': [path.resolve(__lib, 'event-loop.js'), 'setTimeout'],
    'setImmediate': [path.resolve(__lib, 'event-loop.js'), 'setImmediate'],
    'setInterval': [path.resolve(__lib, 'event-loop.js'), 'setInterval']
  }
}

const aliasedNodeModules = {
  'ndef': path.resolve(__lib, 'ndef/dist/index.es6.js'),
  'bus': path.resolve(__lib, 'bus/index.js'),
  'schedule': path.resolve(__lib, 'schedule.js'),
  'series': path.resolve(__helpers, 'series.js'),
  'callN': path.resolve(__helpers, 'callN.js'),
  'once': path.resolve(__helpers, 'callOnce.js')
}

const aliasedEspModules = {
  'event-loop': path.resolve(__lib, 'event-loop.js'),
  'events': path.resolve(__lib, 'polyfill/events.js'),
  'stream': path.resolve(__lib, 'polyfill/stream/index.js'),
  'buffer': path.resolve(__lib, 'polyfill/buffer/index.js'),
}

Object.assign(aliasedEspModules, aliasedNodeModules)

const babelOptions = {
  exclude: 'node_modules/**',
  //babelrc: false,
  presets: [
    ['es2015', { modules: false }]
  ],

  plugins: [
    //'external-helpers',
    /*['transform-object-rest-spread', { loose: true }],
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
    */
  ]
}

const resolveOptions = {
  jsnext: true,
  main: true,
  jail: __approot,
  preferBuiltins: false
}

const commonjsOptions = {
  include: /.+/,
  namedExports: {
    'ndef': ['foo', 'bar']
  }
}

const uglifyOptions = {
  sourceMap: true,
  toplevel: true
}

export default [
  {
    input,
    output: {
      format: 'cjs',
      file: path.resolve(__dist, 'index.node.js')
    },

    plugins: [
      replace(replaceInstanceOf),

      alias(aliasedNodeModules),

      inject(injectPolyfillExcludeNM),

      commonjs(commonjsOptions),

      resolve(resolveOptions)
    ],

    external: [
      'events',
      'stream'
    ]
  },

  {
    input,
    output: {
      format: 'cjs',
      file: path.resolve(__dist, 'index.esp.js')
    },

    plugins: [
      replace(replaceInstanceOf),

      alias(aliasedEspModules),

      inject(injectEventLoopoptions),

      inject(espPolyfills),

      inject(injectPolyfillExcludeNM),

      babel(babelOptions),

      commonjs(commonjsOptions),

      resolve(resolveOptions)
    ]
  },

  {
    input,
    output: {
      format: 'cjs',
      sourcemap: true,
      file: path.resolve(__dist, 'index.esp.min.js'),
    },

    plugins: [
      replace(replaceInstanceOf),

      alias(aliasedEspModules),

      inject(injectEventLoopoptions),

      inject(espPolyfills),

      inject(injectPolyfillExcludeNM),

      commonjs(commonjsOptions),

      resolve(resolveOptions),

      babel(babelOptions),

      uglify(uglifyOptions),

      analyze({
        limit: 5,
        root: __approot
      })
    ]
  }
]
