import EventEmitter from 'events'

function _Stream(options = {}) {
	this.options = {
		highWaterMark: options.highWaterMark || 128
	}
}

_named('Stream', _Stream)

const Stream = _extend({
	name: 'Stream',
	super: [EventEmitter],
	apply: [EventEmitter, _Stream]
})

export default Stream
