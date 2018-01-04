import EventEmitter from 'events'
import BufferState from 'stream/bufferState'
//import Schedule from 'schedule'
import series from 'series'

const DEFAULT_HIGHWATERMARK = 64
// const defaultWatcher = {
//   cache: {},
//   currentPattern: null,
//   arrayOffset: 0,
//   patternIndex: 0,
//   byteIndex: 0,
//   length: 0,
//   active: false
// }

function decrementActive() {
  if ( !--this._busState.active ) {
    this.emit( 'inactive' )
  }
}

function checkIndex( index, length ) {

}

function _resetWatcher( watcher ) {
  watcher.currentPattern = null
  watcher.arrayOffset =
    watcher.patternIndex =
    watcher.byteIndex =
    watcher.length = 0

  watcher.active = false

  return watcher

  // return Object.assign(watcher, defaultWatcher)
}

function _parse() {
  const {
    watching,
    frame,
    _buffer
  } = this._busState

  if ( !watching.length ) {
    this.emit( 'error', {
      msg: 'Unexpected watching data',
      data: this._busState.buffer()
    } )
    return
  }

  if ( this._busState.nodeIndex < 0 ) {
    this._busState.nodeIndex = 0
  }

  for ( ; this._busState.nodeIndex < _buffer.length; this._busState.nodeIndex++ ) {
    const {
      chunk
    } = _buffer[ this._busState.nodeIndex ]
    let currentChunkIndex = 0
    let currentIncomingWatcherIndex = 0
    let watcherIndex = 0
    let isEqual = false
    let isChunkCorrupted = false

    for ( ; currentChunkIndex < chunk.length; currentChunkIndex++ ) {
      let isChunkCorrupted = false
      if ( !this._busState.active ) {
        this._busState.active = this._busState.watching.reduce( ( active, watcher ) => {
          const {
            patterns
          } = watcher
          try {
            watcher.currentPattern = typeof patterns[ 0 ] == 'function' ? patterns[ 0 ]( Buffer.from( [] ) ) : patterns[ 0 ],
              watcher.active = true
            return active + 1
          } catch ( err ) {
            this.emit( 'error', err )
            return active
          }
        }, 0 )
      }

      const byte = chunk[ currentChunkIndex ]

      for ( watcherIndex = 0; watcherIndex < watching.length; watcherIndex++, isEqual = false ) {
        const watcher = watching[ watcherIndex ]

        if ( !watcher.active ) {
          continue
        }

        const expected = watcher.currentPattern[ watcher.byteIndex ]

        // console.log('current watching:', watcher.currentPattern)
        // console.log('current chunk:', chunk)
        // console.log('byte:', byte)
        // console.log('expected:', expected)

        if ( expected === undefined || expected === byte ) {
          isEqual = true
        } else if ( Array.isArray( expected ) ) {
          if ( watcher.arrayOffset <= 0 && expected[ 0 ] > 0 ) {
            watcher.arrayOffset = expected[ 0 ]
          }

          if ( --watcher.arrayOffset > 0 ) {
            watcher.length++
              continue
          }

          isEqual = true
        } else if ( typeof expected == 'function' ) {
          try {
            isEqual = !!expected.call( this, {
              byte,
              index: watcher.byteIndex,
              getRelativeIndex: index => {
                if ( typeof index != 'number' ) {
                  throw TypeError( 'number' )
                }

                index += watcher.byteIndex

                if ( index < 0 || index > watcher.currentPattern.length ) {
                  throw ReferenceError( 'Illegal pattern boundaries' )
                }

                return index + watcher.length - watcher.byteIndex
              },
              getAbsoluteIndex: index => {
                if ( typeof index != 'number' ) {
                  throw TypeError( 'number' )
                }

                if ( index < 0 ) {
                  index += watcher.currentPattern.length
                }

                if ( index < 0 || index > watcher.currentPattern.length ) {
                  throw ReferenceError( 'Illegal pattern boundaries' )
                }

                return index + watcher.length - watcher.byteIndex
              },
              getFrame: () => this._busState.slice( 1 + watcher.length )
            } )
          } catch ( err ) {
            isEqual = false
            this.emit( 'error', err )
          }
        }

        if ( isEqual ) {
          watcher.length++

            if ( ++watcher.byteIndex >= watcher.currentPattern.length ) {
              if ( ++watcher.patternIndex >= watcher.patterns.length ) {
                // console.time( 'buffer' )
                // console.log(watcher.callback)
                const chunk = this._busState.buffer( watcher.length )
                // console.timeEnd( 'buffer' )
                this._busState.nodeIndex = -1
                try {
                  // console.time( 'cb' )
                  watcher.callback(
                    chunk,
                    // frame.splice(-watcher.length),
                    watcher.pattern
                  )
                  // console.timeEnd( 'cb' )
                } catch ( err ) {
                  this.emit( 'error', err )
                }
                // this._busState.watching = []
                // console.time( 'reset' )
                watching.forEach( watcher => {
                  _resetWatcher( watcher )
                  decrementActive.call( this )
                } )
                // console.timeEnd( 'reset' )
              } else {
                // console.time('next pattern')
                const nextPattern = watcher.patterns[ watcher.patternIndex ]
                watcher.byteIndex = 0

                try {
                  if ( typeof nextPattern == 'function' ) {
                    watcher.currentPattern = nextPattern.call( this, this._busState.slice( watcher.length ) )
                  } else {
                    watcher.currentPattern = nextPattern
                  }
                } catch ( err ) {
                  _resetWatcher( watcher )
                  decrementActive.call( this )
                  this.emit( 'error', err )
                }
                // console.timeEnd('next pattern')
              }
            }
        } else {
          console.log( watcher )
          _resetWatcher( watcher )
          decrementActive.call( this )

          if ( !this._busState.active ) {
            this.emit( 'error', {
              msg: 'Unparsed chunk',
              data: this._busState.buffer() // frame.splice(0)
            } )
            //
            // if(!isChunkCorrupted) {
            //   isChunkCorrupted = true
            //   setImmediate(() => {
            //     isChunkCorrupted = false
            //     this.emit('error', {
            //       msg: 'Unparsed chunk',
            //       data: frame.splice(0)
            //     })
            //   })
            // }
          }
        }
      }
    }
  }

  if ( this._busState.active ) {
    this.emit( 'drain' )
  }
}

function _Bus( options = {} ) {
  this.transport = options.transport
  this.type = options.type
  this._setup = options.setup.bind( this )
  this._read = length => options.read.call( this, length === undefined ? length : this.options.highWaterMark )
  this._write = options.write.bind( this )

  this.options = {
    highWaterMark: options.highWaterMark || DEFAULT_HIGHWATERMARK
  }

  this._busState = new BufferState( {
    watching: [],
    active: 0,
    nodeIndex: 0,
    configured: false,
    ticker: false
  } )
}

_Bus.prototype = {
  setup() {
    if ( this._busState.configured ) {
      return Promise.reject( 'already configured' )
    }

    this._busState.configured = true
    return this._setup.apply( this, arguments )
  },

  push( chunk ) {
    if ( chunk.length ) {
      this._busState.push( chunk )

      if ( !this._busState.ticker ) {
        this._busState.ticker = true
        setImmediate( () => {
          this._busState.ticker = false
          _parse.call( this )
        } )
      }
    }
    // const highWaterMark = this.options.highWaterMark,
    //       parse = _parse.bind(this)
    //
    // if(chunk.length > highWaterMark) {
    //   const chunks = []
    //   let subchunkIndex = 0
    //
    //   for(let bytesLeft = chunk.length, offset = 0; bytesLeft > 0; bytesLeft -= highWaterMark) {
    //     const subchunk = chunk.slice(offset, offset += highWaterMark)
    //     chunks.push(subchunk)
    //   }
    //
    //   series(chunks, (next, subchunk) => {
    //     parse(subchunk)
    //     next()
    //   })
    // }
    // else {
    //   parse(chunk)
    // }
  },

  watch( patterns, cb ) {
    const watcher = _resetWatcher( {
      patterns,
      callback: cb.bind( this )
    } )

    this._busState.watching.push( watcher )

    return watcher
  },

  unwatch( watcher ) {
    if ( watcher ) {
      const index = this._busState.watching.indexOf( watcher )

      if ( index >= 0 ) {
        this._busState.watching.splice( index, 1 )
      }
    } else {
      this._busState.watching.splice( 0 )
    }

    return this
  },

  /**
    @TODO Promise interface
  */

  rx( patterns, ...args ) {
    let cb, options = {}

    if ( typeof args[ 0 ] == 'function' ) {
      cb = args[ 0 ]
    } else if ( typeof args[ 1 ] == 'function' ) {
      cb = args[ 1 ]
      Object.assign( options, args[ 0 ] )
    } else {
      throw new ReferenceError( 'Callback is not provided' )
    }

    let watcher
    const setWatcher = () => {
      watcher = this.watch( patterns, cb )
      this._read( this.options.highWaterMark )
    }

    if ( 'timeout' in options ) {
      setTimeout( setWatcher, options.timeout )
    } else {
      setWatcher()
    }

    return watcher
  },

  tx( binary, options = {} ) {
    if ( 'timeout' in options ) {
      setTimeout( () => {
        this._write( binary )
      }, options.timeout )
    } else {
      this._write( binary )
    }

    return this
  },

  reset() {
    this._busState.watching.splice( 0 )
    return this
  }
}

const Bus = _extend( {
  super: [ _Bus, EventEmitter ],
  apply: [ _Bus, EventEmitter ]
} )

export default Bus
