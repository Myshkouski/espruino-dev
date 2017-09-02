import EventEmitter from 'events'

function _Stream(options = {}) {
	this.options = {
		highWaterMark: options.highWaterMark || 128
	}
}

const Stream = _extend({
	super: [_Stream, EventEmitter],
	apply: [_Stream]
})

export default Stream
