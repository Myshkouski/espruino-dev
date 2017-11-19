import path from 'path'
import merge from 'lodash.merge'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import yaml from 'rollup-plugin-yaml'

const __approot =path.resolve(__dirname, '../')
const __src = path.resolve(__approot, 'src/')
const __dist = path.resolve(__approot, 'dist/')



const bundles = []

bundles.push({
  input: path.resolve(__src, 'ndef.js'),
  output: {
    file: path.resolve(__dist, 'index.cjs.js'),
    format: 'cjs'
  },
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      jail: __approot,
      preferBuiltins: false
    }),

    commonjs(),

    yaml(),

    babel({
      exclude: 'node_modules/**'
    })
  ]
})

bundles.push(merge({}, bundles[0], {
  output: {
    file: path.resolve(__dist, 'index.esm.js'),
    format: 'es'
  }
}))

export default bundles
