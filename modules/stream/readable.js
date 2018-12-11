import Stream from './stream'
import BufferState from './bufferState'

const encodings = {
	BINARY: 'binary',
	UTF8: 'utf8'
}

function toString(binary) {
	let str = ''
	for (let i = 0; i < binary.length; i++)
		str += String.fromCharCode(binary[i])
	return str
}

// function _broadcast() {
// 	let chunk = this.read()
// 	if(chunk && chunk.length) {
// 		process.nextTick(() => {
// 			if(this._readableState.defaultEncoding == encodings.UTF8) {
// 				chunk = toString(chunk)
// 			}
// 			this.emit('data', chunk, this._readableState.defaultEncoding)
// 		})
// 	}
// }

function _flow() {
	if (this._readableState.flowing) {
		// _broadcast.call(this)
		let chunk = this.read()
		if (chunk && chunk.length) {
			process.nextTick(() => {
				if (this._readableState.defaultEncoding == encodings.UTF8) {
					chunk = toString(chunk)
				}
				this.emit('data', chunk, this._readableState.defaultEncoding)
			})
		}
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

	if (!this._read)
		throw new TypeError('_read() is not implemented')
	if (!this._read instanceof Function)
		throw new TypeError('\'options.read\' should be a function, passed', typeof options.read)
}

_Readable.prototype = {
	pause() {
		//console.log('pause()')
		if (this._readableState.flowing !== false) {
			this._readableState.flowing = false
			this.emit('pause')
		}

		return this
	},

	resume() {
		if (!this._readableState.flowing) {
			this._readableState.flowing = true
			this.emit('resume')
			_flow.call(this)
		}

		return this
	},

	read(length) {
		if (length < 0) {
			throw new Error('"length" must be more than 0')
		}

		if (!this._readableState.ended) {
			if (length === undefined) {
				if (this._readableState.length < this.options.highWaterMark) {
					this._read(this.options.highWaterMark - this._readableState.length)
				}
			} else if (length > this._readableState.length) {
				this._read(length - this._readableState.length)
			}
		}

		if (this._readableState.ended) {
			if (this._readableState.length) {
				return this._readableState.buffer()
			}

			return null
		}

		if (length !== undefined && this._readableState.length < length) {
			return null
		}

		return this._readableState.buffer(length)
	},

	push(chunk) {
		//console.log('push(' + chunk + ')')
		if (chunk === null) {
			_end.call(this)
			return false
		}

		const overflow = this._readableState.push(chunk) > this.options.highWaterMark

		if (!overflow) {
			_flow.call(this)
		}

		return !overflow
	},

	pipe(writable) {
		const alreadyPiped = !this.pipes.some(pipe => {
			pipe.writable === writable
		})
		if (alreadyPiped) {
			const listener = (data, pipe) => {
				if (!writable.write(data)) {
					pipe.stopped = true
					this.pause()

					writable.once('drain', () => {
						this.resume()
					})
				}
			}

			const pipe = {
				writable,
				listener,
				stopped: undefined
			}

			this
				.on('data', data => {
					listener(data, pipe)
				})
				.pipes.push(pipe)

			if (writable instanceof Stream) {
				writable.emit('pipe')
			}
		}

		return writable
	},

	unpipe(writable) {
		if (writable) {
			const pipe = this.pipes.find(pipe => {
				pipe.writable === writable
			})

			if (pipe) {
				this.removeListener('data', pipe.listener)
			}
		} else {
			for (let index in this.pipes) {
				this.removeListener(this.pipes[index].listener)
			}
			this.pipes.splice(0)
		}
	},

	on(event, listener) {
		if (event == 'data')
			this.resume()

		return Stream.prototype.on.apply(this, arguments)
	},

	removeListener(event, listener) {
		if (event == 'data') {
			//@TODO !!! this._listeners should be implemented
			//console.log(this.listeners)
			this.pause()
		}

		return Stream.prototype.removeListener.apply(this, arguments)
	},

	isPaused() {
		return !this._readableState.flowing
	}
}

const Readable = _extend({
	name: 'Readable',
	super: [Stream, _Readable],
	apply: [Stream, _named('Readable', _Readable)]
})

export default Readable
