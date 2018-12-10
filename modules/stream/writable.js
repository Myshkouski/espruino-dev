import Stream from './stream'
import BufferState from './bufferState'

function _readFromInternalBuffer(...args) {
  const spliced = this._writableState.nodes(...args)

  if (this._writableState.needDrain && (this._writableState.length < this.options.highWaterMark)) {
    this._writableState.needDrain = false
    this.emit('drain')
  }

  return spliced
}

function _flush() {
  const {
    _writableState
  } = this

  if (_writableState.corked)
    return

  if (!_writableState.length) {
    if (_writableState.ended)
      this.emit('finish')

    return
  }

  const cb = err => {
    if (err)
      this.emit('error', err)

    _writableState.consumed = true

    process.nextTick(() => {
      _flush.call(this)
    })
  }

  if (!_writableState.corked && _writableState.consumed) {
    _writableState.consumed = false

    if (this._writev) {
      const nodes = _readFromInternalBuffer.call(this)

      this._writev(nodes, cb)
    } else {
      const node = _readFromInternalBuffer.call(this, 1)[0]

      this._write(node.chunk, node.encoding, cb)
    }
  }
}

function _Writable(options = {}) {
  this._write = options.write.bind(this)

  this._writableState = new BufferState({
    getBuffer: () => this._writableState._buffer,

    corked: 0,
    consumed: true,
    needDrain: false,
    ended: false,
    decodeStrings: true
  })
}

_Writable.prototype = {
  write(chunk /*, encoding*/ ) {
    const {
      _writableState
    } = this, {
      buffer
    } = _writableState

    if (_writableState.ended)
      throw new Error('Write after end')

    this._writableState.push(chunk)

    _flush.call(this)

    return _writableState.length < this.options.highWaterMark
  },

  end() {
    this.write.apply(this, arguments)
    this._writableState.ended = true
    return this
  },

  cork() {
    this._writableState.corked++
  },

  uncork() {
    if (this._writableState.corked > 0) {
      this._writableState.corked--
      _flush.call(this)
    }
  }
}

const Writable = _extend({
  name: 'Writable',
  super: [Stream, _Writable],
  apply: [Stream, _named('Writable', _Writable)]
})

export default Writable
