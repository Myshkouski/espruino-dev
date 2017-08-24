import Stream from './stream'
import EventEmitter from 'events'
console.log('!')
const to = require('buffer/utils/to')
console.log('!')


function _readFree() {
	return this._read(this._readableState.highWaterMark - this._readableState.buffer.length)
}

function _readFromInternalBuffer(length) {
	const data = this._readableState.buffer.slice(0, length !== undefined ? length : this.options.highWaterMark)
	this._readableState.buffer = Buffer.from([])

	return data
}

function _broadcast() {
	if(this._readableState.buffer.length > 0)
		this.emit('data', _readFromInternalBuffer.call(this))
}

function _flow() {
	if(this._readableState.flowing === true)
		_broadcast.call(this)

	process.nextTick(() => _readFree.call(this))
}

function _end() {
	this._readableState.flowing = null
	this._readableState.ended = true

}

const Readable = extend(Stream, function Readable() {
	const options = arguments[0] || {}

	this._readableState = {
		buffer: Buffer.from([]),
		flowing: null,
		ended: false
	}

	this.pipes = []

	this._read = options.read
	if(!this._read)
		throw new TypeError('_read() is not implemented')
	if(!this._read instanceof Function)
		throw new TypeError('\'options.read\' should be a function, passed', typeof options.read)
}, true)

Readable.prototype.pause = function pause() {
	if(this._readableState.flowing !== false) {
		this._readableState.flowing = false
		this.emit('pause')
	}

	return this
}

Readable.prototype.resume = function resume() {
	if(!this._readableState.flowing) {
		this._readableState.flowing = true
		this.emit('resume')
		_flow.call(this)
	}

	_broadcast.call(this)

	return this
}

Readable.prototype.read = function read() {
	const length = arguments[0] !== undefined ? arguments[0] : this.options.highWaterMark
	return _readFromInternalBuffer.call(this, length)
}

Readable.prototype.push = function push(chunk) {
	if(chunk === null) {
		_end.call(this)
		return false
	}

	const data = Buffer.from(chunk)

	if(data.length)
		this._readableState.buffer = Buffer.concat([this._readableState.buffer, data], this._readableState.buffer.length + data.length)

	const overflow = this._readableState.buffer.length > this.options.highWaterMark

	if(!overflow)
		_flow.call(this)

	return !overflow
}

Readable.prototype.pipe = function pipe(writable) {
	if(!this.pipes.some(pipe => (pipe.writable === writable))) {
		const listener = data => writable.write(data)

		this
			.on('data', listener)
			.pipes.push({ writable, listener })
	}

	return writable
}

Readable.prototype.unpipe = function unpipe(writable) {
  if(writable) {
    const pipe = this.pipes.find(pipe => ( pipe.writable === writable ))

    if(pipe)
      this.removeListener('data', pipe.listener)
  }

  else {
    for(let { listener } of this.pipes)
      this.removeListener(listener)
    this.pipes.splice(0, this.pipes.length)
  }
}

Readable.prototype.on = function on(event, listener) {
	if(event === 'data')
		this.resume()

	return Stream.prototype.on.apply(this, arguments)
}

Readable.prototype.removeListener = function removeListener(event, listener) {
	if(event === 'data')
		this.pause()

	return Stream.prototype.removeListener.apply(this, arguments)
}

Readable.prototype.isPaused = function isPaused() {
	return !this._readableState.flowing
}

export default Readable
