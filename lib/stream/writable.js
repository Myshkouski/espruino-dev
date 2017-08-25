import Stream from './stream'

const Writable = extend(Stream, function Writable() {
  const options = arguments[0] || {}
  this._write = options.write

  this._writableState = {
    buffer: [],
    length: 0,
    getBuffer: () => this._writableState.buffer,

    corked: false,
    consumed: true
  }
}, true)

Writable.prototype.write = function write(chunk/*, encoding*/) {
  const self = this

  const data = {
    chunk: Buffer.from(chunk),
    encoding: 'binary',
    next: null
  }

  // = Buffer.concat([self._writableState.buffer, buffer], self._writableState.buffer.length + buffer.length)

  const state = self._writableState
  const buffer = state.buffer

  buffer.push(data)
  buffer[ buffer.length - 1 ].next = data
  state.length += data.chunk.length

  function _writeInternalBuffer() {
    if(!buffer.length)
      return

    function cb(err) {
      process.nextTick(() => {
        if(err)
          throw err

        state.consumed = true

        if(buffer.length > 0)
          _writeInternalBuffer()
      })
    }

    if(!state.corked && state.consumed) {
      state.consumed = false

      let toConsume

      if(self._writev && buffer.length > 1) {
        toConsume = buffer.map(d => ({ chunk: d.chunk, encoding: d.encoding}))
        buffer.splice(0, buffer.length)
        state.length = 0
        self._writev(toConsume, cb)
      }
      else {
        toConsume = buffer.shift()
        state.length -= toConsume.chunk.length
        self._write(toConsume.chunk, toConsume.encoding, cb)
      }
    }
  }

  _writeInternalBuffer()

  return state.length > self.options.highWaterMark
}

export default Writable
