import defer from './defer'
import loop from './loop'

const _setTimeout = (function (cb, timeout) {
  defer(loop.timeout, () => setTimeout(cb, timeout))
})

export default _setTimeout
