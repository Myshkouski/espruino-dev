function EventEmitter() { }

_named('EventEmitter', EventEmitter)

EventEmitter.prototype.on = function on() {
  Object.prototype.on.apply(this, arguments)

  return this
}

EventEmitter.prototype.once = function once(event, listener) {
  function _listener() {
    this.removeListener(event, _listener)
    return listener.apply(this, arguments)
  }

  return this.on(event, _listener)
}

export default EventEmitter
