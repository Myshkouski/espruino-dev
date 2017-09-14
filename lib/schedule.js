import EventEmitter from 'events'

function _Schedule() {
  this._edge = Promise.resolve()
  this.slots = {}
}

const Schedule = _extend({
  name: 'Schedule',
  super: [EventEmitter],
  apply: [EventEmitter, _Schedule]
})

Schedule.prototype.immediate = function (task) {
  this._edge = Promise.all([
    this._edge,
    Promise.resolve(task(this.slots)).catch(err => this.emit('error', err))
  ])

  return this
}

Schedule.prototype.deferred = function (task) {
  this._edge = this._edge.then(r => task(this.slots)).catch(err => this.emit('error', err))

  return this
}

export default Schedule
