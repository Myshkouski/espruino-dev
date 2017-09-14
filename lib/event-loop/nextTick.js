import defer from './defer'
import loop from './loop'

const _nextTick = (function nextTick(cb) {
  defer(loop.nextTick, cb)
}).bind(this)

export default _nextTick
