import Stream from './stream'

const Writable = extend(Stream, function Writable() {
  const options = arguments[0] || {}
  this._write = options.write

  this._writableState = {
    buffer: new Buffer(0),
    getBuffer: () => this._writableState.buffer,

    corked: false,
    consumed: true
  }
}, true)

Writable.prototype.write = function write(chunk) {
  console.log('write() started')
  const buffer = Buffer.from(chunk)
  this._writableState.buffer = this._writableState.buffer.concat(buffer)

  function writeInternalBuffer() {
    const length = (this._writableState.buffer.length > this.options.highWaterMark)
      ? this.options.highWaterMark
      : this._writableState.buffer.length

    const buffer = this._writableState.buffer.slice(0, length)
    this._writableState.buffer = new Buffer(this._writableState.buffer.slice(length + 1, this._writableState.buffer.length))

    function cb(err) {
      if(err)
        throw err

      this._writableState.consumed = true
      writeInternalBuffer()
    }

    if(!this._writableState.corked && this._writableState.consumed) {
      this._writableState.consumed = false
      this._write(buffer, 'binary', cb)
    }
  }

  return this
}

export default Writable
