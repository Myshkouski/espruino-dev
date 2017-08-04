import Stream from './stream'

const Writable = extend(Stream, function Writable() {
  const options = arguments[0] || {}
  this.write = options.write



  this._writableState = {
    buffer: new Buffer(0),
    getBuffer: () => this._writableState.buffer,

    corked: false,
    consumed: true
  }
}, true)

Writable.prototype.write = function write(chunk) {
  const buffer = Buffer.from(chunk)
  this._writableState.buffer = this._writableState.buffer.concat(buffer)

  if(!this._writableState.corked && this._writableState.consumed) {
    const cb = err => {
      if(err)
        throw err

      this._writableState.consumed = true
      this._write(this._writableState.getBuffer(), 'binary', cb)
    }
    this._writableState.consumed = false
    this._write(this._writableState.getBuffer(), 'binary', cb)
  }
}

export default Writable
