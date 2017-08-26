import { Duplex } from 'stream'

function _read(size) {

}

function _write() {

}

const Bus = extend(Duplex, function Bus() {
  const options = arguments[0] || {}

  options.read = _read
  options.write = _write

  Duplex.call(this, options)

  this.options.frameTypes = []
  this.options._frameState = {
    buffer: []
  }
}, false)

Bus.prototype.tx = function tx() {

}

Bus.prototype.rx = function rx() {

}

export default Bus
