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

/*
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
*/

function _flush() {
  const { _writableState } = this

  if(_writableState.corked)
    return

  if(!_writableState.buffer.length) {
    if(_writableState.ended)
      this.emit('finish')

    return
  }

  const cb = err => {
    if(err)
      this.emit('error', err)

    _writableState.consumed = true

    process.nextTick(() => {
      _flush.call(this)
    })
  }

  if(!_writableState.corked && _writableState.consumed) {
    _writableState.consumed = false

    if(this._writev) {
      const toConsume = _readFromInternalBuffer.call(this, 0).map(d => ({ chunk: d.chunk, encoding: d.encoding}))

      this._writev(toConsume, cb)
    } else {
      const toConsume = _readFromInternalBuffer.call(this, 0, 1)[0]

      this._write(toConsume.chunk, toConsume.encoding, cb)
    }
  }
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
    ended: false,
    defaultEncoding: 'utf8',
    decodeStrings: true
  }
}

const Writable = _extend({
	name: 'Writable',
  super: [Stream],
  apply: [Stream, _named('Writable', _Writable)]
})

Writable.prototype.write = function (chunk/*, encoding*/) {
  const { _writableState } = this,
        { buffer } = _writableState

  if(_writableState.ended)
    throw new Error('Write after end')

  const data = {
    chunk: Buffer.from(chunk),//new Uint8Array(chunk),
    encoding: 'binary',
    next: null
  }

  if(buffer.length)
    buffer[buffer.length - 1].next = data
  buffer.push(data)
  _writableState.length += data.chunk.length

  _flush.call(this)

  return _writableState.length < this.options.highWaterMark
}



Writable.prototype.end = function() {
  this.write.apply(this, arguments)
  this._writableState.ended = true
  return this
}

Writable.prototype.cork = function() {
  this._writableState.corked++
}

Writable.prototype.uncork = function() {
  if(this._writableState.corked > 0) {
    this._writableState.corked--
    _flush.call(this)
  }
}

export default Writable
