import { Duplex } from 'stream'
import Schedule from 'schedule'
import EventEmitter from 'events'

function _read(size) {

}

function _write(data, encoding, cb) {
  this.slots.incoming.emit('data', { chunk: data, encoding })

  cb()
}

function _Bus(options = {}) {
  Duplex.call(this, {
    read: _read,
    write: _write,
    highWaterMark: options.highWaterMark
  })

  this._setup = options.setup.bind(this)

  this.slots.incoming = new EventEmitter()

  this._busState = {
    configured: false,
    parsing: Buffer.from([]),
    //parsedFrames: []
  }
}

const Bus = _extend({
  name: 'Bus',
  super: [Duplex, Schedule],
  apply: [Schedule, _Bus]
})

Bus.prototype.setup = function(...args) {
  return this.deferred(slots => {
    if(this._busState.configured)
      return Promise.reject('already configured')

    this._busState.configured = true
    return this._setup(slots, ...args)
  })
}

export default Bus
