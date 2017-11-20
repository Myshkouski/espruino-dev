import { Writable } from 'stream'
import Schedule from 'schedule'
import series from 'series'

function _parse(chunk, encoding, cb) {
  const { incoming, watching, frame } = this._busState

  let currentChunkIndex = 0,
      currentIncomingWatcherIndex = 0,
      incomingIndex = 0,
      isEqual = false,
      isChunkCorrupted = false

  if(!watching.length) {
    this.emit('error', new Error({
      msg: 'Unexpected incoming data',
      data: chunk
    }))
  }
  else {
    for(;currentChunkIndex < chunk.length; currentChunkIndex ++) {
      frame.push(chunk[currentChunkIndex])

      if(!incoming.length) {
        for(let watchingIndex in watching) {
          try {
            incoming.push({
              patterns: watching[watchingIndex].patterns,
              callback: watching[watchingIndex].callback,
              currentPattern: watching[watchingIndex].patterns[0] instanceof Function ? watching[watchingIndex].patterns[0]([]) : watching[watchingIndex].patterns[0],
              arrayOffset: 0,
              patternIndex: 0,
              byteIndex: 0,
              length: 0
            })
          } catch(err) {
            this.emit('error', err)
          }
        }
      }

      for(incomingIndex = 0; incomingIndex < incoming.length;) {
        const incomingI = incoming[incomingIndex],
              expected = incomingI.currentPattern[incomingI.byteIndex]

        if(expected === undefined || expected === chunk[currentChunkIndex]) {
          isEqual = true

          incomingI.byteIndex ++
        }
        else if(expected instanceof Array) {
          isEqual = true

          if(incomingI.arrayOffset <= 0 && expected[0] > 0) {
            incomingI.arrayOffset = expected[0]
          }

          if(--incomingI.arrayOffset > 0) {
            continue
          }
          else {
            incomingI.byteIndex ++
          }
        }
        else if(expected instanceof Function) {
          try {
            isEqual = !!expected.call(this, chunk[currentChunkIndex], incomingI.length, frame.slice(-incomingI.length - 1))
            incomingI.byteIndex ++
          } catch(err) {
            this.emit('error', err)
            isEqual = false
          }
        }
        else {
          isEqual = false
        }

        if(isEqual) {
          incomingI.length ++

          if(incomingI.byteIndex >= incomingI.currentPattern.length) {
            if(++ incomingI.patternIndex >= incomingI.patterns.length) {
              try {
                incomingI.callback.call(
                  this,
                  frame.splice(-incomingI.length),
                  incomingI.pattern
                )
              } catch(err) {
                this.emit('error', err)
              }

              incoming.splice(0)
              //break
            }
            else {
              const nextPattern = incomingI.patterns[incomingI.patternIndex]
              incomingI.byteIndex = 0
              try {
                if(nextPattern instanceof Function) {
                  incomingI.currentPattern = nextPattern(frame.slice(-incomingI.length))
                }
                else {
                  incomingI.currentPattern = nextPattern
                }
                incomingIndex ++
              } catch(err) {
                this.emit('error', err)
                incoming.splice(incomingIndex, 1)
              }
            }
          }
          else {
            incomingIndex ++
          }
        }
        else {
          incoming.splice(incomingIndex, 1)
        }
      }

      if(!incoming.length && frame.length) {
        this.emit('error', {
          msg: 'Unparsed chunk',
          data: frame.splice(0)
        })
        /*
        if(!isChunkCorrupted) {
          isChunkCorrupted = true
          setImmediate(() => {
            isChunkCorrupted = false
            this.emit('error', {
              msg: 'Unparsed chunk',
              data: frame.splice(0)
            })
          })
        }*/
      }
    }
  }

  cb()
}

function _write(chunk, encoding, cb) {
  const highWaterMark = this.options.highWaterMark

  if(chunk.length > highWaterMark) {
    const chunks = []
    let subchunkIndex = 0

    for(let bytesLeft = chunk.length, offset = 0; bytesLeft > 0; bytesLeft -= highWaterMark) {
      const subchunk = chunk.slice(offset, offset += highWaterMark)
      chunks.push(next => _parse.call(this, subchunk, encoding, next))
    }

    series(chunks, cb)
  }
  else {
    _parse.apply(this, arguments)
  }
}

function _Bus(options = {}) {
  Writable.call(this, Object.assign({}, options, {
    write: _write
  }))

  this._setup = options.setup.bind(this)

  this._busState = {
    watching: [],
    incoming: [],
    frame: [],
    configured: false
  }
}

_Bus.prototype = {
  setup (...args) {
    return this.deferred(slots => {
      if(this._busState.configured)
        return Promise.reject('already configured')

      this._busState.configured = true
      return this._setup(slots, ...args)
    })
  },

  watch (patterns, callback) {
    const watcher = {
      patterns,
      callback
    }

    this._busState.watching.push(watcher)

    return watcher
  },

  unwatch (watcher) {
    if(watcher) {
      const index = this._busState.watching.indexOf(watcher)

      if(index >= 0)
        this._busState.watching.splice(index, 1)
    } else {
      this._busState.watching.splice(0)
    }

    return this
  },

  /**
    * @TODO - Proper unwatch(): delete all previously RXed watchers
    */
  rx(patterns, cb) {
    const watcher = this.watch(patterns, frame => {
      //this.unwatch(watcher)
      const index = this._busState.watching.indexOf(watcher)

      if(index >= 0)
        this._busState.watching.splice(0, index + 1)

      cb(frame)
    })

    return this
  },

  tx(binary, options = {}) {
    return this.deferred(() => {
      console.log('tx')
      if('timeout' in options) {
        return new Promise((done, fail) => {
          setTimeout(() => {
            this.write(binary)
            done()
          }, options.timeout)
        })
      }

      this.write(binary)

      return Promise.resolve()
    })
  },

  reset () {
    this._busState.frame.splice(0)
    this._busState.incoming.splice(0)
    return this
  }
}

const Bus = _extend({
  name: 'Bus',
  super: [Writable, Schedule, _Bus],
  apply: [_Bus, Schedule]
})

export default Bus
