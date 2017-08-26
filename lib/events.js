function EventEmitter() {}

EventEmitter.prototype.on = function on() {
	Object.prototype.on.apply(this, arguments)

	return this
}

export default EventEmitter
