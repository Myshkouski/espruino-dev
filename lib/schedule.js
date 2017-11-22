import EventEmitter from 'events'

function _Schedule() {
  this.pending = Promise.resolve(null)
}

_Schedule.prototype = {
  immediate(task) {
    this.pending = Promise.all([
      this.pending,
      new Promise((done, fail) => {
        task(done, fail)
      }).catch(err => this.emit('error', err))
    ])

    return this
  },

  deferred(task) {
    this.pending = this.pending
      .then(r => new Promise((done, fail) => {
        task(done, fail)
      }))
      .catch(err => this.emit('error', err))

    return this
  }
}

// const Schedule = _extend({
//   name: 'Schedule',
//   super: [EventEmitter, _named('Schedule', _Schedule)],
//   apply: [EventEmitter, _named('Schedule', _Schedule)]
// })

export default _Schedule
