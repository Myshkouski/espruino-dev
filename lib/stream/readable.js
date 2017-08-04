import Stream from './stream'

const Readable = extend(Stream, function Readable() {
	const options = arguments[0] || {}

	this._readableState = {
		buffer: new Buffer(0),
		flowing: null
	}

	this.pipes = []

  this._read = options.read
	if(!this._read)
		throw new TypeError('_read() is not implemented')
	if(!this._read instanceof Function)
		throw new TypeError('\'options.read\' should be a function, passed', typeof options.read)
	this._read()
}, true)

function broadcast() {
	return this.emit('data', this.read())
}

Readable.prototype.pause = function pause() {
	this._readableState.flowing = false

	return this
}

Readable.prototype.resume = function resume() {
	this._readableState.flowing = true

	if(this._readableState.buffer.length > 0)
		broadcast.call(this)

	return this
}

Readable.prototype.read = function read(length) {
	const data = this._readableState.buffer.slice(0, length !== undefined ? length : this.options.highWaterMark)
	this._readableState.buffer = new Buffer(0)
	return data
}

Readable.prototype.push = function push(chunk) {
	const data = new Buffer.from(chunk)

	if(data.length) {
		this._readableState.buffer = this._readableState.buffer.concat(data)

		if(!!this._readableState.flowing)
			broadcast.call(this)
	}

	return this._readableState.buffer.length > this.options.highWaterMark
		? false
		: true
}

Readable.prototype.pipe = function pipe(writable) {
	function listener(data) {
		writable.write(data)
	}

	this.pipes.push({ writable, listener })

	this.on('data', listener)

	this.resume()

	return writable
}

Readable.prototype.unpipe = function unpipe(writable) {
  if(writable) {
    const pipe = this.pipes.find(pipe => ( pipe.writable === writable ))

    if(pipe)
      this.removeListener('data', pipe.listener)
  }

  else {
    for(let p in this.pipes)
      this.removeListener(this.pipes[p].listener)
    this.pipes.splice(0, this.pipes.length)
  }
}

Readable.prototype.on = function on(event, listener) {
  if(event === 'data')
    this.resume()

	return Stream.prototype.on.apply(this, arguments)
}

export default Readable
