import EventEmitter from 'events'

function _Stream(options = {}) {
	this.options = {
		highWaterMark: options.highWaterMark || 128
	}
}

const Stream = extend(_Stream, EventEmitter)

export default Stream
