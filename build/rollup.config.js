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

const __approot = path.resolve(__dirname, '../')
const __lib = path.resolve(__approot, 'lib')
const __helpers = path.resolve(__approot, 'helpers')
const __dist = path.resolve(__approot, 'bundle')
const __src = path.resolve(__approot, 'src')



export default {
  input: path.resolve(__src, 'index.js'),
  output: {
    sourcemap: true,
    file: path.resolve(__dist, 'index.esp.rollup.js'),
    format: 'cjs'
  },
  plugins: [
    replace({
      patterns: [
        {
          include: 'src/**',
          exclude: path.resolve(__lib, 'instanceOf.js'),
          test: /(?!\s)([\[\]{}\w.\s+\-*/><]+)[\r\n\t\s]+instanceof[\r\n\t\s]+([\[\]{}\w.\s+\-*/><]+)(?!\s)/ig,
          replace: (...args) => `instanceOf(${ args[1] }, ${ args[2] })`
        }
      ]
    }),

    babel({
      exclude: 'node_modules/**',
      babelrc: false,
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
    }),

    inject({
      exclude: path.resolve(__lib, 'event-loop') + '/**',
      modules: {
        'setTimeout': path.resolve(__lib, 'event-loop/setTimeout.js'),
      }
    }),

    inject({
      //exclude: 'node_modules/**',
      modules: {
        'Promise': path.resolve(__lib, 'promise.js'),
        'Buffer': path.resolve(__lib, 'buffer/index.js'),
        'setImmediate': path.resolve(__lib, 'event-loop/setImmediate.js'),
        'process': path.resolve(__lib, 'process.js')
      }
    }),

    inject({
      exclude: 'node_modules/**',
      modules: {
        '_named': path.resolve(__helpers, 'namedFunc.js'),
        '_extend': [path.resolve(__lib, 'extend.js'), '_extend'],
        'extend': [path.resolve(__lib, 'extend.js'), 'extend'],
        'blink': path.resolve(__lib, 'blink.js'),
        'instanceOf': path.resolve(__helpers, 'instanceOf.js'),
        'defProp': [path.resolve(__helpers, 'def.js'), 'defProp']
      }
    }),

    alias({
      'nextTick': path.resolve(__lib, 'event-loop/nextTick.js'),
      'events': path.resolve(__lib, 'events.js'),
      'stream': path.resolve(__lib, 'stream/index.js'),
      'bus': path.resolve(__lib, 'bus/index.js'),
      'buffer': path.resolve(__lib, 'buffer/index.js'),
      'schedule': path.resolve(__lib, 'schedule.js'),
      'callN': path.resolve(__helpers, 'callN.js'),
      'once': path.resolve(__helpers, 'callOnce.js')
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

    //
    /*
    uglify({
      sourceMap: true,
      toplevel: true
    })
    //
    */
  ]
}
