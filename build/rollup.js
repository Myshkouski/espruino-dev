import path from 'path'
import babel from 'rollup-plugin-babel'
import inject from 'rollup-plugin-inject'
import eslint from 'rollup-plugin-eslint'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import root from 'rollup-plugin-root-import'
import yaml from 'rollup-plugin-yaml'
import alias from 'rollup-plugin-alias'
import replace from 'rollup-plugin-re'
import uglify from 'rollup-plugin-uglify'
import legacy from 'rollup-plugin-legacy'
import analyze from 'rollup-analyzer-plugin'
import defaults from 'lodash.defaultsdeep'
import includePaths from 'rollup-plugin-includepaths'

const __approot = path.resolve(__dirname, '../')
const __lib = path.resolve(__approot, 'lib')
const __helpers = path.resolve(__approot, 'helpers')
const __polyfill = path.resolve(__approot, 'polyfill')
const __dist = path.resolve(__approot, 'bundle')
const __src = path.resolve(__approot, 'src')
const input = path.resolve(__src, 'index.js')

const bundlerName = 'rollup'
const targetPlatform = 'esp'

const espPolyfills = {
  //exclude: 'node_modules/**',
  modules: {
    'Object': path.resolve(__polyfill, 'object.js'),
    'Array': path.resolve(__polyfill, 'array.js'),
    //'Promise': path.resolve(__lib, 'polyfill/promise.js'),
    'Buffer': path.resolve(__lib, 'buffer/index.js'),
    'process': path.resolve(__polyfill, 'process.js'),
    'console': path.resolve(__polyfill, 'console.js')
  }
}

const injectPolyfillExcludeNM = {
  exclude: 'node_modules/**',
  modules: {
    '_named': path.resolve(__helpers, 'namedFunc.js'),
    '_extend': [path.resolve(__lib, 'extend.js'), '_extend'],
    'extend': [path.resolve(__lib, 'extend.js'), 'extend'],
    'iof': path.resolve(__lib, 'instanceOf.js'),
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
    'setTimeout': [path.resolve(__polyfill, 'event-loop.js'), 'setTimeout'],
    'setImmediate': [path.resolve(__polyfill, 'event-loop.js'), 'setImmediate'],
    'setInterval': [path.resolve(__polyfill, 'event-loop.js'), 'setInterval']
  }
}

const aliasedNodeModules = {
  // 'ndef': path.resolve(__lib, 'ndef/dist/index.js'),
  // 'nfc': path.resolve(__lib, 'nfc/index.js'),
  // 'bus': path.resolve(__lib, 'bus/index.js'),
  // 'schedule': path.resolve(__lib, 'schedule.js'),
  'series': path.resolve(__helpers, 'series.js'),
  'callN': path.resolve(__helpers, 'callN.js'),
  'once': path.resolve(__helpers, 'callOnce.js')
}

const aliasedEspModules = {
  'event-loop': path.resolve(__polyfill, 'event-loop.js'),
  // 'events': path.resolve(__lib, 'events.js'),
  // 'stream': path.resolve(__lib, 'stream/index.js'),
  // 'buffer': path.resolve(__lib, 'buffer/index.js'),
  // 'blink': path.resolve(__lib, 'blink.js')
}

Object.assign(aliasedEspModules, aliasedNodeModules)

const babelOptions = {
  exclude: 'node_modules/**'
}

const resolveOptions = {
  module: true,
  jsnext: true,
  main: true,
  jail: __approot,
  preferBuiltins: false,
  customResolveOptions: {
    moduleDirectory: ['lib', 'node_modules']
  },
  extensions: ['.js', '.json', '.yaml']
}

const commonjsOptions = {
  include: /.+/
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
      resolve(resolveOptions),

      commonjs(commonjsOptions),

      replace(replaceInstanceOf),

      alias(aliasedNodeModules),

      inject(injectPolyfillExcludeNM),

      yaml()
    ]
  },

  {
    input,
    output: {
      format: 'cjs',
      file: path.resolve(__dist, 'index.esp.js')
    },

    plugins: [
      resolve(resolveOptions),

      commonjs(commonjsOptions),

      replace(replaceInstanceOf),

      alias(aliasedEspModules),

      inject(injectEventLoopoptions),

      inject(espPolyfills),

      inject(injectPolyfillExcludeNM),

      yaml(),

      babel(babelOptions)
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
      resolve(resolveOptions),

      commonjs(commonjsOptions),

      replace(replaceInstanceOf),

      alias(aliasedEspModules),

      inject(injectEventLoopoptions),

      inject(espPolyfills),

      inject(injectPolyfillExcludeNM),

      yaml(),

      babel(babelOptions),

      uglify(uglifyOptions),

      analyze({
        limit: 5,
        root: __approot
      })
    ]
  }
]
