import { Readable, Writable, Duplex, Transform } from 'stream'

const Bus = extend(Transform, function Bus() {
  const options = arguments[0] || {}
  this.options = {
    decode: options.decode
    encode: options.encode
  }
}, false)

export default Bus
