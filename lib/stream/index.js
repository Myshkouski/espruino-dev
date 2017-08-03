import EventEmitter from 'events'

function concatenateUint8Arrays() {
    let totalLength = 0;
    for (let a in arguments) {
        totalLength += arguments[a].length;
    }
    let result = new Uint8Array(totalLength);
    let offset = 0;
    for (let a in arguments) {
        result.set(arguments[a], offset);
        offset += arguments[a].length;
    }
    return result;
}

const Readable = extend(EventEmitter /*with*/, function Readable() {
	const options = arguments[0] || {}

	this._readableState = {
		buffer: new Buffer(0),
		flowing: null
	}

	this.options = {
		highWaterMark: options.highWaterMark || 128
	}

	this.pipes = []
})

Readable.prototype.resume = function resume() {
	this._readableState.flowing = true

	if(this._readableState.buffer.length > 0)
		this.emit('data', this._readableState.buffer.length)

	return this
}

Readable.prototype._read = function _read(length) {
	return this._readableState.buffer.splice(0, length !== undefined ? length : this._readableState.buffer.length)
}

Readable.prototype.push = function push(chunk) {
	const data = new Buffer.from(chunk)

	if(this._readableState.flowing === true) {
		this.emit('data', data)
		return true
	}

	this._readableState.buffer = concatenateUint8Arrays(this._readableState.buffer, data)
	return this._readableState.buffer.length > this.options.highWaterMark
		? false
		: true
}

Readable.prototype.pipe = function pipe(writable) {
	this._readableState.flowing = true

	function callback(data) {
		writable.write(data)
	}

	this.pipes.push({ writable, callback })

	this.on('data', callback)
}

Readable.prototype.on = function on(chunk) {
	this._readableState.flowing = true

	if(this._readableState.buffer.length > 0) {
		this.emit('data', this._readableState.buffer)
		this._readableState.buffer = new Buffer(0)
	}

	return EventEmitter.prototype.on.apply(this, arguments)
}

function Writable(options) {
  const options = arguments[0] || {}
  this.write = options.write
}

export { Writable, Readable }
