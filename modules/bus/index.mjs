import EventEmitter from 'events'
import {
	Duplex,
	Readable,
	Writable
} from 'stream'

const DEFAULT_HIGHWATERMARK = 64

function _resetWatcher(watcher = [
	[], 0, []
]) {
	watcher[0] = watcher[2].slice(0)
	watcher[1] = 0

	return watcher
}

function _pushTo(target, source) {
	source = source || []

	for (let index = 0; index < source.length; index++) {
		target.push(source[index])
	}

	return target
}

function _resolve(byte, expected) {
	if (expected[0].length > expected[1]) {
		let expectedByte = expected[0][expected[1]]

		if (expectedByte instanceof Function) {
			var consumedChunk = expected[0].slice(0, expected[1])
			expectedByte = expectedByte.call(undefined, byte, expected[1], expected[0])

			if (Array.isArray(expectedByte)) {
				var header = expected[0].slice(0, expected[1])
				var trailer = expected[0].slice(1 + expected[1], expected[0].length)

				expected[0] = _pushTo(header, expectedByte).concat(trailer)
				expectedByte = expectedByte[0]
			}
		}

		if (!expectedByte || expectedByte === byte) {
			expected[0][expected[1]] = byte

			expected[1]++

			return true
		}
	}

	return false
}

function _toConsumablePattern(frame) {
	const consumablePattern = []

	for (let index in frame) {
		let pattern = frame[index]

		if (Array.isArray(pattern)) {
			_pushTo(consumablePattern, pattern)
		} else {
			consumablePattern.push(pattern)
		}
	}

	for (let index in consumablePattern) {
		const value = consumablePattern[index]
		if (!(!isNaN(value) || value instanceof Function || value === undefined)) {
			throw new TypeError('Cannot create pattern with "' + typeof value + '" type')
		}
	}

	return consumablePattern
}

class Bus extends Duplex {
	constructor(source) {
		super()

		this._sending = []
		this._watchers = []
	}

	setup() {
		if (this._busState.configured) {
			return Promise.reject('already configured')
		}

		this._busState.configured = true
		return this._setup.apply(this, arguments)
	}

	_read(size) {
		let sent = 0
		let index = 0

		for (;index < this._sending.length;) {
			const chunk = this._sending[index]
			index++
			if (!this.push(chunk)) {
				break
			}
			sent += chunk.length
		}

		index && this._sending.splice(0, index)
	}

	_write(chunk, encoding, cb) {
		if (!this._watchers.length) {
			this.emit('error', new Error('Unexpected incoming data'))
		}

		for (let watcherIndex = 0; watcherIndex < this._watchers.length; watcherIndex++) {
			var expected = this._watchers[watcherIndex]

			for (var index in buffer) {
				var resolved = _resolve(buffer[index], expected)

				if (!resolved) {
					console.log('not match at', expected[1], expected[0])
					expected.splice(watcherIndex, 1)

					break
				}

				if (expected[0].length === expected[1]) {
					console.log('found', expected[0])
					this._watchers.splice(0, this._watchers.length)
					break
				}
			}
		}

		cb()
	}

	watch(list, cb) {
		const watcher = _resetWatcher({
			list,
			callback: cb.bind(this)
		})

		this._patterns.push(watcher)

		return watcher
	}

	unwatch(watcher) {
		if (watcher) {
			const index = this._patterns.indexOf(watcher)

			if (index >= 0) {
				if (this._busState.watching[index].active) {
					_resetWatcher(watcher)
					_decrementActive.call(this)
				}

				this._busState.watching.splice(index, 1)
			}
		} else {
			this._busState.watching.splice(0)
			_resetActive.call(this)
		}

		return this
	}

	expect(list, ...args) {
		let cb, options = {}

		if (typeof args[0] == 'function') {
			cb = args[0]
		} else if (typeof args[1] == 'function') {
			cb = args[1]
			Object.assign(options, args[0])
		} else {
			throw new ReferenceError('Callback is not provided')
		}

		let watcher
		const setWatcher = () => {
			watcher = this.watch(list, (...args) => {
				this.unwatch(watcher)
				cb.apply(this, args)
			})
			this._read(this.options.highWaterMark)
		}

		// if ( 'timeout' in options ) {
		//   setTimeout( setWatcher, options.timeout )
		// } else {
		//
		// }

		setWatcher()

		return watcher
	}

	send(chunk, options = {}) {
		this._sending.push(chunk)
		this.push()

		return this
	}

	reset() {
		this._patterns.splice(0)
		return this
	}
}

export default Bus

const bus = new Bus()

const readable = new Readable({
	read(size = 0) {
		console.log('readable#read()')
		this.push(new Array(size).fill(0).join(''))
		this.push(null)
	}
})

const writable = new Writable({
	write(chunk, encoding, cb) {
		console.log('writable#write()')
		cb()
	}
})

readable.pipe(bus).pipe(writable)

bus
	// .on('data', console.log.bind(console, 'data:'))
	.on('end', console.log.bind(console, 'end with:'))
	.on('error', console.log.bind('error'))

setTimeout(() => {
	bus.send('abc')
	// console.log(bus.read())
}, 500)
