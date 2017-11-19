import EventEmitter from 'events'

function _Stream(options = {}) {
	this.options = {
		highWaterMark: options.highWaterMark || 128
	}
}

const Stream = _extend({
	name: 'Stream',
	super: [EventEmitter],
	apply: [EventEmitter, _named('Stream', _Stream)]
})

Stream.prototype.emit = function (event, err) {
	if(event === 'error' && !(this['#onerror'] || this._events['error']))
		throw new Error(err)

	return EventEmitter.prototype.emit.apply(this, arguments)
}

export default Stream
