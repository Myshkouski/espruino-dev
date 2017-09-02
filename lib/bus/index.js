import { Duplex } from 'stream'

function _read(size) {

}

function _write() {

}

function _Bus(options = {}) {
  this.setup = options.setup.bind(this)

  Duplex.call(this, {
    read: _read,
    write: _write
  })

  this.options.frameTypes = []
  this.options._frameState = {
    buffer: []
  }
}

const Bus = _extend({
  super: [Duplex],
  apply: [_Bus]
})

Bus.prototype.tx = function tx() {

}

Bus.prototype.rx = function rx() {

}

export default Bus
