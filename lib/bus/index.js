import { Duplex } from 'stream'

function _read(size) {

}

function _write(data, encoding, cb) {
  const binary = Buffer.from(data)
  this._busState.parsing = Buffer.concat([this._busState.parsing, binary], this._busState.parsing.length + binary.length)

  //optimize

  this.frameSet.some(frameSet => {
    let frame

    try {
      frame = frameSet.decode.call(this, this._busState.parsing)
    } catch(err) {
      return false
    }

    //this.options._busState.parsedFrames.push(frame)

    this.emit('frame', frame)

    return true
  })

  cb()
}

function _Bus(options = {}) {
  Duplex.call(this, {
    read: _read,
    write: _write,
    highWaterMark: options.highWaterMark
  })

  defProp(this, 'setup', {
    value: (...args) => {
      if(!this._busState.configured) {
        //console.log(options.setup)
        options.setup.apply(this, args)
      }
      else
        throw new Error('Bus has been already set up.')

      return this
    }
  })

  this.frameSet = []
  /*this.options.optimize = {
    handlers: [],

  }*/
  this._busState = {
    configured: false,
    parsing: Buffer.from([]),
    //parsedFrames: []
  }
}

const Bus = _extend({
  super: [Duplex],
  apply: [_Bus]
})

Bus.prototype.tx = function tx(binary, cb) {

}

Bus.prototype.rx = function rx() {

}

export default Bus
