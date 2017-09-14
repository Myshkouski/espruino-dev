import defer from './defer'
import loop from './loop'

const _setImmediate = (function(cb) {
  defer(loop.immediate, cb)
}).bind(this)

export default _setImmediate
