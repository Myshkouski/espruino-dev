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
import progress from 'rollup-plugin-progress'
import filesize from 'rollup-plugin-filesize'
import typeOf from 'rollup-plugin-inline-typeof'

const __approot = path.resolve(__dirname, '../')
const __lib = path.resolve(__approot, 'lib')
const __helpers = path.resolve(__approot, 'helpers')
const __globals = path.resolve(__approot, 'globals')
const __dist = path.resolve(__approot, 'bundle')
const __src = path.resolve(__approot, 'src')
const input = path.resolve(__src, 'index.js')

const bundlerName = 'rollup'
const targetPlatform = 'esp'

const espPolyfills = {
  modules: {
    'Object': path.resolve(__globals, 'object.js'),
    'Array': path.resolve(__globals, 'array.js'),
    'Promise': path.resolve(__globals, 'promise.js'),
    'Buffer': path.resolve(__globals, 'buffer.js'),
    //'process': path.resolve(__globals, 'process.js'),
    'console': path.resolve(__globals, 'console.js')
  }
}

const injectPolyfillExcludeNM = {
  exclude: 'node_modules/**',
  modules: {
    '_extend': [path.resolve(__globals, 'extend/index.js'), '_extend'],
    'extend': [path.resolve(__globals, 'extend/index.js'), 'extend'],
    '_named': path.resolve(__globals, 'namedFunc.js'),
    'defProp': [path.resolve(__globals, 'def.js'), 'defProp'],
    'iof': path.resolve(__globals, 'iof.js')
  }
}

const injectEventLoopOptions = {
  exclude: `${ path.resolve(__lib, 'event-loop.js') }/**`,
  modules: {
    //'setTimeout': [path.resolve(__globals, 'event-loop.js'), 'setTimeout'],
    'setImmediate': [path.resolve(__globals, 'event-loop.js'), 'setImmediate'],
    //'setInterval': [path.resolve(__globals, 'event-loop.js'), 'setInterval']
  }
}

const replaceInstanceOf = {
  // patterns: [
  //   {
  //     include: __src + '/**',
  //     exclude: path.resolve(__lib, 'iof.js'),
  //     test: /(?!\s)([\[\]{}\w.\s+\-*/><]+)[\r\n\t\s]+instanceof[\r\n\t\s]+([\[\]{}\w.\s+\-*/><]+)(?!\s)/ig,
  //     replace: (...args) => `iof(${ args[1] }, ${ args[2] })`
  //   }
  // ]
}

const aliasedNodeModules = {
  // 'ndef': path.resolve(__lib, 'ndef/dist/index.js'),
  // 'nfc': path.resolve(__lib, 'nfc/index.js'),
  // 'bus': path.resolve(__lib, 'bus/index.js'),
  // 'schedule': path.resolve(__lib, 'schedule.js'),
  // 'series': path.resolve(__helpers, 'series.js'),
  // 'callN': path.resolve(__helpers, 'callN.js'),
  'once': path.resolve(__helpers, 'callOnce.js')
}

const aliasedEspModules = {
  // 'event-loop': path.resolve(__globals, 'event-loop.js'),
  'events': path.resolve(__lib, 'events.js'),
  // 'stream': path.resolve(__lib, 'stream/index.js'),
  // 'buffer': path.resolve(__globals, 'buffer/index.js'),
  // 'blink': path.resolve(__lib, 'blink.js')
}

Object.assign(aliasedEspModules, aliasedNodeModules)

const ESP32globals = {
  modules: {
    // 'global': path.resolve(__approot, 'platforms/esp32.js')
  }
}

const babelOptions = {
  exclude: 'node_modules/**'
}

const resolveOptions = {
  module: true,
  jsnext: true,
  main: true,
  jail: __approot,
  // preferBuiltins: false,
  customResolveOptions: {
    // order makes sense!
    moduleDirectory: ['lib', 'helpers', 'node_modules']
  },
  extensions: ['.js', '.json', '.yaml', '.yml']
}

const commonjsOptions = {
  include: /.+/
}

const uglifyOptions = {
  sourceMap: true,
  toplevel: true,
  compress: {
    unsafe: true,
    unsafe_proto: true,
    passes: 3
  },
  mangle: {
    // properties: {
    //   regex: /^_/
    // }
  }
}

export default [
  {
    input: 'src/test.js',
    output: {
      format: 'cjs',
      file: path.resolve(__dist, 'test.js')
    },

    plugins: [
      resolve(resolveOptions),

      commonjs(commonjsOptions),

      alias(aliasedNodeModules),

      inject(injectPolyfillExcludeNM),

      replace(replaceInstanceOf),

      // typeOf(),

      yaml()
    ]
  },

  {
    input,
    output: {
      format: 'cjs',
      file: path.resolve(__dist, 'index.pico.js')
    },

    plugins: [
      resolve(resolveOptions),

      commonjs(commonjsOptions),

      alias(aliasedEspModules),

      inject(injectEventLoopOptions),

      inject(espPolyfills),

      inject(injectPolyfillExcludeNM),

      replace(replaceInstanceOf),

      // typeOf(),

      yaml(),

      babel(babelOptions),

      eslint({}),

      filesize()
    ]
  },

  {
    input,
    output: {
      format: 'cjs',
      sourcemap: true,
      file: path.resolve(__dist, 'index.pico.min.js'),
    },

    plugins: [
      resolve(resolveOptions),

      commonjs(commonjsOptions),

      alias(aliasedEspModules),

      inject(injectEventLoopOptions),

      inject(espPolyfills),

      inject(injectPolyfillExcludeNM),

      replace(replaceInstanceOf),

      // typeOf(),

      yaml(),

      babel(babelOptions),

      uglify(uglifyOptions),

      analyze({
        limit: 5,
        root: __approot
      }),



      filesize()
    ]
  },

  {
    input,
    output: {
      format: 'cjs',
      sourcemap: true,
      file: path.resolve(__dist, 'index.esp32.min.js'),
    },

    plugins: [
      resolve(resolveOptions),

      commonjs(commonjsOptions),

      alias(aliasedEspModules),

      inject(injectEventLoopOptions),

      inject(espPolyfills),

      inject(injectPolyfillExcludeNM),

      inject(ESP32globals),

      replace(replaceInstanceOf),

      // typeOf(),

      yaml(),

      babel(babelOptions),

      uglify(uglifyOptions),

      analyze({
        limit: 5,
        root: __approot
      }),



      filesize()
    ]
  }
].reverse()
