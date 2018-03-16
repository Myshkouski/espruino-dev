import EventEmitter from 'events'
import BufferState from 'stream/bufferState'
//import Schedule from 'schedule'
import series from 'series'

const DEFAULT_HIGHWATERMARK = 64

function _resetWatcher( watcher ) {
  return Object.assign( watcher, {
    active: false,
    currentPattern: null,
    length: 0,
    offset: 0,
    byteIndex: 0,
    patternIndex: 0
  } )
}

function _resetActive() {
  this._busState.active = 0
  this.emit( 'inactive' )
}

function _decrementActive() {
  if ( !--this._busState.active ) {
    this.emit( 'inactive' )
  }
}

function _found( watcher ) {
  const {
    _busState
  } = this
  const {
    watching
  } = _busState
  const chunk = _busState.buffer( watcher.length )
  _busState.nodeIndex = -1
  try {
    // console.time( 'cb' )
    watcher.callback(
      chunk,
      // frame.splice(-watcher.length),
      watcher
    )
    // console.timeEnd( 'cb' )
  } catch ( err ) {
    this.emit( 'error', err )
  }
  // _busState.watching = []
  // console.time( 'reset' )
  watching.forEach( _resetWatcher )
  _resetActive.call( this )
  // console.timeEnd( 'reset' )
}

function _nextPattern( watcher ) {
  if ( 1 + watcher.patternIndex < watcher.list.length ) {
    // console.time('next pattern')
    const nextPattern = watcher.list[ ++watcher.patternIndex /* patternIndex has already been incremented when checked condition */ ]
    watcher.byteIndex = 0

    if ( typeof nextPattern == 'function' ) {
      try {
        watcher.currentPattern = nextPattern.call( this, this._busState.slice( 1 + watcher.length ) )
      } catch ( err ) {
        _resetWatcher( watcher )
        _decrementActive.call( this )
        this.emit( 'error', err )
      }
    } else {
      watcher.currentPattern = nextPattern
    }
    // console.timeEnd('next pattern')
  } else {
    _found.call( this, watcher )
  }
}

function _push() {
  // console.log( '_push()' )
  const {
    _busState
  } = this
  const {
    watching,
    _buffer
  } = _busState

  for ( ; _busState.nodeIndex < _buffer.length; _busState.nodeIndex++ ) {
    if ( !watching.length ) {
      this.emit( 'error', {
        msg: 'Unexpected incoming data',
        data: _busState.buffer()
      } )
      return
    }

    if ( _busState.nodeIndex < 0 ) {
      _busState.nodeIndex = 0
    }

    const {
      chunk
    } = _buffer[ _busState.nodeIndex ]
    let currentChunkIndex = 0
    let currentIncomingWatcherIndex = 0
    let watcherIndex = 0
    let isEqual = false
    let isChunkCorrupted = false

    if ( !_busState.active ) {
      _busState.active = _busState.watching.reduce( ( active, watcher ) => {
        const {
          list
        } = watcher
        try {
          watcher.currentPattern = typeof list[ 0 ] == 'function' ? list[ 0 ].call( this, _busState.slice( watcher.length ) ) : list[ 0 ]
          watcher.active = true
          return 1 + active
        } catch ( err ) {
          this.emit( 'error', err )
          return active
        }
      }, 0 )
    }

    for ( ; currentChunkIndex < chunk.length; currentChunkIndex++ ) {
      let isChunkCorrupted = false
      const byte = chunk[ currentChunkIndex ]

      for ( watcherIndex = 0; watcherIndex < watching.length; watcherIndex++, isEqual = false ) {
        const watcher = watching[ watcherIndex ]
        if ( !watcher.active ) {
          continue
        }

        const {
          currentPattern
        } = watcher

        if ( Array.isArray( currentPattern ) || ArrayBuffer.isView( currentPattern ) ) {
          const expected = currentPattern[ watcher.byteIndex ]

          if ( expected === undefined || ( typeof expected == 'number' && expected === byte ) ) {
            isEqual = true
          } else if ( typeof expected == 'function' ) {
            try {
              isEqual = !!expected.call( this, byte, watcher.length - 1 /*i.e. index*/ , _busState.slice( 1 + watcher.length /*i.e. actual length*/ ) )
            } catch ( err ) {
              this.emit( 'error', err )
            }
          }

          // if ( !isEqual ) {
          //   console.log( 'current watching:', watcher.currentPattern )
          //   console.log( 'current chunk:', chunk )
          //   console.log( 'byte:', byte )
          //   console.log( 'expected:', expected )
          // }

          if ( isEqual ) {
            ++watcher.length

            if ( 1 + watcher.byteIndex < currentPattern.length ) {
              ++watcher.byteIndex
            } else {
              _nextPattern.call( this, watcher )
            }
          } else {
            _resetWatcher( watcher )
            _decrementActive.call( this )

            // console.log( 'active', _busState.active )

            if ( !_busState.active ) {
              this.emit( 'error', {
                message: 'Unparsed chunk',
                expected,
                actual: byte,
                pattern: currentPattern,
                chunk: _busState.buffer(),
                index: currentChunkIndex,
                value: byte
              } )
            }

            // break
          }
        } else if ( typeof currentPattern == 'number' ) {
          if ( currentPattern <= 0 ) {
            throw Object.assign( new ReferenceError( 'Pattern length should be a positive integer' ), {
              pattern: currentPattern
            } )
          }

          if ( watcher.offset <= 0 ) {
            watcher.offset = currentPattern
          }

          watcher.length++

            if ( --watcher.offset < 1 ) {
              _nextPattern.call( this, watcher )
            }
        } else {
          throw new TypeError( `Cannot parse pattern of ${ typeof currentPattern } type` )
        }
      }
    }
  }

  if ( _busState.active ) {
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
    // console.log( 'push()' )
    // console.log( chunk )
    if ( chunk.length ) {
      this._busState.push( chunk )

      if ( !this._busState.ticker ) {
        this._busState.ticker = true
        setImmediate( () => {
          this._busState.ticker = false
          _push.call( this )
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

  watch( list, cb ) {
    const watcher = _resetWatcher( {
      list,
      callback: cb.bind( this )
    } )

    this._busState.watching.push( watcher )

    return watcher
  },

  unwatch( watcher ) {
    if ( watcher ) {
      const index = this._busState.watching.indexOf( watcher )

      if ( index >= 0 ) {
        if ( this._busState.watching[ index ].active ) {
          _resetWatcher( watcher )
          _decrementActive.call( this )
        }

        this._busState.watching.splice( index, 1 )
      }
    } else {
      this._busState.watching.splice( 0 )
      _resetActive.call( this )
    }

    return this
  },

  /**
    @TODO Promise interface
  */

  expect( list, ...args ) {
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
      watcher = this.watch( list, ( ...args ) => {
        this.unwatch( watcher )
        cb.apply( this, args )
      } )
      this._read( this.options.highWaterMark )
    }

    // if ( 'timeout' in options ) {
    //   setTimeout( setWatcher, options.timeout )
    // } else {
    //
    // }

    setWatcher()

    return watcher
  },

  send( binary, options = {} ) {
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
  proto: [ EventEmitter, _Bus ],
  apply: [ EventEmitter, _Bus ]
} )

export default Bus
