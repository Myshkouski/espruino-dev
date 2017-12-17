//import { Writable } from 'stream'
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
    let currentChunkIndex = currentIncomingWatcherIndex = watcherIndex = 0,
      isEqual = isChunkCorrupted = false

    for ( ; currentChunkIndex < chunk.length; currentChunkIndex++ ) {
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
            isEqual = !!expected.call( this, byte, watcher.length, this._busState.slice( 1 + watcher.length ) )
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
                watching.forEach( _resetWatcher )
                this._busState.active = 0
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
                  this._busState.active--
                  this.emit( 'error', err )
                }
                // console.timeEnd('next pattern')
              }
            }
        } else {
          _resetWatcher( watcher )
          this._busState.active--

          if ( !watching.length && this._busState.length ) {
            this.emit( 'error', {
              msg: 'Unparsed chunk',
              data: this._busState.buffer() // frame.splice(0)
            } )
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

        // console.timeEnd('isEqual')
      }
    }
  }
}

function _Bus( options = {} ) {
  this._setup = options.setup.bind( this )
  this._read = options.read.bind( this )
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

  parse( chunk ) {
    this._busState.push( chunk )

    if ( !this._busState.ticker ) {
      this._busState.ticker = true
      setImmediate( () => {
        this._busState.ticker = false
        _parse.call( this )
      } )
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

  rx( patterns, cb ) {
    const watcher = this.watch( patterns, cb )
    this._read()
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

export default _Bus
