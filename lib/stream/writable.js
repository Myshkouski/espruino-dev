import Stream from './stream'

function _readFromInternalBuffer(...args) {
  const spliced = this._writableState.buffer.splice(...args)
  this._writableState.length -= spliced.reduce((length, data) => (length += data.chunk.length), 0)

  if(this._writableState.needDrain && (this._writableState.length < this.options.highWaterMark)) {
    this._writableState.needDrain = false
    this.emit('drain')
  }

  return spliced
}

function _writeToInternalBuffer(chunk, encoding) {
  const data = {
    chunk: Buffer.from(chunk),
    encoding: 'binary',
    next: null
  }

  if(this._writableState.buffer.length)
    this._writableState.buffer[this._writableState.buffer.length - 1].next = data
  this._writableState.buffer.push(data)
  this._writableState.length += data.chunk.length

  return this._writableState.buffer
}

function write(chunk/*, encoding*/) {
  //console.log('write(' + chunk + ')')
  _writeToInternalBuffer.apply(this, arguments)

  ;(function _consume() {
    if(!this._writableState.buffer.length)
      return

    const cb = err => {
      if(err)
        throw err

      process.nextTick(() => {
        this._writableState.consumed = true

        if(this._writableState.buffer.length > 0)
          _consume()
      })
    }

    if(!this._writableState.corked && this._writableState.consumed) {
      this._writableState.consumed = false

      if(this._writev && this._writableState.buffer.length > 1) {
        const toConsume = _readFromInternalBuffer
          .call(this, 0, this._writableState.buffer.length)
          .map(d => ({ chunk: d.chunk, encoding: d.encoding}))

        this._writev(toConsume, cb)
      }
      else {
        const toConsume = _readFromInternalBuffer.call(this, 0, 1).shift()

        this._write(toConsume.chunk, toConsume.encoding, cb)
      }
    }
  }).call(this)

  return this._writableState.length < this.options.highWaterMark
}

function _Writable(options = {}) {
	this._write = options.write.bind(this)

  this._writableState = {
    buffer: [],
    length: 0,
    getBuffer: () => this._writableState.buffer,

    corked: 0,
    consumed: true,
    needDrain: false,
    defaultEncoding: 'utf8',
    decodeStrings: true
  }
}

_named('Writable', _Writable)

const Writable = _extend({
	name: 'Writable',
  super: [Stream],
  apply: [Stream, _Writable]
})

Writable.prototype.write = write

export default Writable
