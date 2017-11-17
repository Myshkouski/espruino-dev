import Stream from './stream'
import BufferState from './bufferState'

const encodings = {
	BINARY: 'binary',
	UTF8: 'utf8'
}

function _readFree() {
	return this._read(this._readableState.highWaterMark - this._readableState.length)
}

function toString(binary) {
	let str = ''
	for(let i = 0; i < binary.length; i++)
		str += String.fromCharCode(binary[i])
	return str
}

function _broadcast() {
	let chunk = _this._readableState.slice(0)
	if(chunk.length > 0) {
		process.nextTick(() => {
			if(this._readableState.defaultEncoding == encodings.UTF8) {
				chunk = toString(chunk)
			}
			this.emit('data', chunk, this._readableState.defaultEncoding)
		})
	}
}

function _flow() {
	//console.log('_flow()', this._readableState.flowing)
	if(this._readableState.flowing) {
		_broadcast.call(this)
		process.nextTick(() => _readFree.call(this))
	}
}

function _end() {
	this._readableState.flowing = null
	this._readableState.ended = true

}

function _Readable(options = {}) {
	this._readableState = new BufferState({
		flowing: null,
		ended: false,
		defaultEncoding: encodings.BINARY
	})

	this.pipes = []

	this._read = options.read.bind(this)

	if(!this._read)
		throw new TypeError('_read() is not implemented')
	if(!this._read instanceof Function)
		throw new TypeError('\'options.read\' should be a function, passed', typeof options.read)
}
_named('Readable', _Readable)

const Readable = _extend({
	name: 'Readable',
	super: [Stream],
	apply: [Stream, _Readable]
})

Readable.prototype.pause = function pause() {
	//console.log('pause()')
	if(this._readableState.flowing !== false) {
		this._readableState.flowing = false
		this.emit('pause')
	}

	return this
}

Readable.prototype.resume = function resume() {
	//console.log('resume()')
	if(!this._readableState.flowing) {
		this._readableState.flowing = true
		this.emit('resume')
		_flow.call(this)
	}

	//_broadcast.call(this)

	return this
}

Readable.prototype.read = function read(length = this.options.highWaterMark) {
	return this._readableState.slice(0, length)
}

Readable.prototype.push = function push(chunk) {
	//console.log('push(' + chunk + ')')
	if(chunk === null) {
		_end.call(this)
		return false
	}

	const overflow = this._readableState.push(chunk) > this.options.highWaterMark

	if(!overflow)
		_flow.call(this)

	return !overflow
}

Readable.prototype.pipe = function pipe(writable) {
	if(!this.pipes.some(pipe => (pipe.writable === writable))) {
		const listener = (data, pipe) => {
			if(!writable.write(data)) {
				pipe.stopped = true
				this.pause()

				writable.once('drain', () => this.resume())
			}
		}

		const pipe = { writable, listener, stopped: undefined }

		this
			.on('data', data => listener(data, pipe))
			.pipes.push(pipe)
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
	if(event == 'data')
		this.resume()

	return Stream.prototype.on.apply(this, arguments)
}

Readable.prototype.removeListener = function removeListener(event, listener) {
	if(event == 'data') {
		//!!! this._listeners should be implemented
		//console.log(this.listeners)
		this.pause()
	}

	return Stream.prototype.removeListener.apply(this, arguments)
}

Readable.prototype.isPaused = function isPaused() {
	return !this._readableState.flowing
}

export default Readable
