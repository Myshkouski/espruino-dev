import EventEmitter from 'events'

const Stream = extend(EventEmitter, function Stream() {
	const options = arguments[0] || {}

	this.options = {
		highWaterMark: options.highWaterMark || 128
	}
}, true)

export default Stream
