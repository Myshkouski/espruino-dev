import { Duplex } from 'stream'

const Bus = extend(Duplex, function Bus() {
  const options = arguments[0] || {}

  this.options.frameTypes = []
  this.options._frameState = []
}, false)

export default Bus
