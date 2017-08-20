import Stream from './stream'

const Writable = extend(Stream, function Writable() {
  const options = arguments[0] || {}
  this._write = options.write

  this._writableState = {
    buffer: Buffer.from([]),
    getBuffer: () => this._writableState.buffer,

    corked: false,
    consumed: true
  }
}, true)

Writable.prototype.write = function write(chunk) {
  const self = this
  const buffer = Buffer.from(chunk)
  self._writableState.buffer = Buffer.concat([self._writableState.buffer, buffer], self._writableState.buffer.length + buffer.length)

  function writeInternalBuffer() {
    const length = (self._writableState.buffer.length > self.options.highWaterMark)
      ? self.options.highWaterMark
      : self._writableState.buffer.length

    const buffer = self._writableState.buffer
    self._writableState.buffer = Buffer.from([])

    function cb(err) {
      if(err)
        throw err

      self._writableState.consumed = true

      if(self._writableState.buffer.length > 0)
        writeInternalBuffer()
    }

    if(!self._writableState.corked && self._writableState.consumed) {
      self._writableState.consumed = false
      self._write(buffer, 'binary', cb)
    }
  }

  writeInternalBuffer()

  return self
}

export default Writable
