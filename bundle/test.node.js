'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var EventEmitter = _interopDefault(require('events'));

var _named = (name, f) => Object.defineProperty(f, 'name', { value: name });

var data = { SUPER_CHAIN_PROTO_PROP:"_super",
  SUPER_CHAIN_APPLY_PROP:"_apply",
  PROTOTYPE_IS_EXTENDED_PROP:"_isExtended" };

var SUPER_CHAIN_PROTO_PROP = data.SUPER_CHAIN_PROTO_PROP;
var SUPER_CHAIN_APPLY_PROP = data.SUPER_CHAIN_APPLY_PROP;
var PROTOTYPE_IS_EXTENDED_PROP = data.PROTOTYPE_IS_EXTENDED_PROP;

const _copyChain = ( Extended, ProtoChain, chainPropName, ignoreExtended ) => {
  //if chain on [Extended] has not been created yet
  if ( !Extended.prototype[ chainPropName ] ) {
    Object.defineProperty( Extended.prototype, chainPropName, {
      value: []
    } );
  }

  ProtoChain.forEach( Proto => {
    //console.log(!!Proto.prototype['__extended__'], Proto)
    //if [Proto] has been '__extended__' and has same-named proto chain, copy the Proto chain to Extended chain
    const isExtended = !!Proto.prototype[ PROTOTYPE_IS_EXTENDED_PROP ],
      hasSameChain = !!Proto.prototype[ chainPropName ];

    const alreadyInChain = Extended.prototype[ chainPropName ].some( P => P === Proto ),
      shouldBePushed = ( !isExtended || !ignoreExtended ) && !alreadyInChain,
      shouldCopyChain = isExtended && hasSameChain;

    if ( shouldCopyChain )
      Proto.prototype[ chainPropName ].forEach( Proto => {
        //avoid pushing twice
        if ( !Extended.prototype[ chainPropName ].some( P => P === Proto ) ) {
          //console.log('pushed', Proto)
          Extended.prototype[ chainPropName ].push( Proto );
        }
      } );

    if ( shouldBePushed ) {
      Extended.prototype[ chainPropName ].push( Proto );
    }
  } );

  //console.log(Extended.prototype[chainPropName])
};

const _extend = ( options = {} ) => {
  if ( !options.apply )
    options.apply = [];
  if ( !options.proto )
    options.proto = [];
  // if ( !options.static )
  //   options.static = []

  const Child = options.proto[ 0 ];

  if ( !options.name )
    options.name = Child.name;

  function Extended() {
    Extended.prototype[ SUPER_CHAIN_APPLY_PROP ].forEach( Super => {
      if ( Super !== Extended ) {
        Super.apply( this, arguments );
      }
    } );
  }

  _named( options.name, Extended );

  // for ( let i in options.static ) {
  //   for ( let prop in options.static[ i ] ) {
  //     if ( 'prototype' != prop ) {
  //       Object.defineProperty( Extended, prop, {
  //         value: proto[ prop ],
  //         enumerable: true,
  //         writable: true
  //       } )
  //     }
  //   }
  // }

  Object.defineProperty( Extended, 'prototype', {
    value: {}
  } );
  Object.defineProperty( Extended.prototype, 'constructor', {
    value: Child
  } );
  Object.defineProperty( Extended.prototype, PROTOTYPE_IS_EXTENDED_PROP, {
    value: true
  } );

  for ( let i in options.proto ) {
    function Proto() {}
    Proto.prototype = options.proto[ i ].prototype;
    const proto = new Proto();

    for ( let prop in proto ) {
      if ( [ 'constructor', PROTOTYPE_IS_EXTENDED_PROP, SUPER_CHAIN_PROTO_PROP, SUPER_CHAIN_APPLY_PROP ].indexOf( prop ) < 0 ) {
        Object.defineProperty( Extended.prototype, prop, {
          value: proto[ prop ],
          enumerable: true,
          writable: true
        } );
      }
    }
  }

  _copyChain( Extended, options.proto, SUPER_CHAIN_PROTO_PROP, false );
  _copyChain( Extended, options.apply, SUPER_CHAIN_APPLY_PROP, true );

  return Extended
};

function BufferState( options = {} ) {
  Object.assign( this, {
    _buffer: [],
    length: 0
  }, options );
}

BufferState.prototype = {
  push( chunk ) {
    if ( chunk.length ) {
      const node = {
        chunk: Buffer.from( chunk ),
        encoding: 'binary',
        next: null
      };

      if ( this._buffer.length ) {
        this._buffer[ this._buffer.length - 1 ].next = node;
      }

      this._buffer.push( node );
      this.length += node.chunk.length;
    }

    return this.length
  },

  unshift( chunk ) {
    const node = {
      chunk: Buffer.from( chunk ),
      encoding: 'binary',
      next: null
    };

    if ( this._buffer.length ) {
      node.next = this._buffer[ 0 ];
    }

    this._buffer.unshift( node );
    this.length += node.chunk.length;

    return this.length
  },

  nodes( count ) {
    const nodes = this._buffer.splice( 0, count );
    nodes.forEach( node => this.length -= node.chunk.length );

    return nodes
  },

  at( index ) {
    if ( index >= this.length || index < 0 ) {
      return
    }

    for ( let nodeIndex = 0; nodeIndex < this._buffer.length; nodeIndex++ ) {
      const chunk = this._buffer[ nodeIndex ].chunk;
      if ( index < chunk.length ) {
        return {
          index,
          nodeIndex,
          value: chunk[ index ]
        }
      }

      index -= chunk.length;
    }
  },

  for ( from, to, callee ) {
    const firstNode = this._buffer[ from.nodeIndex ];
    for ( let index = from.nodeIndex; index < firstNode.chunk.length; index++ ) {
      callee.call( this, firstNode.chunk[ index ] );
    }

    for ( let nodeIndex = 1 + from.nodeIndex; nodeIndex < to.nodeIndex; nodeIndex++ ) {
      const node = this._buffer[ nodeIndex ];
      for ( let index = 0; index < node.chunk.length; index++ ) {
        callee.call( this, node.chunk[ index ] );
      }
    }

    if ( from.nodeIndex < to.nodeIndex ) {
      const lastNode = this._buffer[ to.nodeIndex ];
      for ( let index = 0; index <= to.index; index++ ) {
        callee.call( this, lastNode.chunk[ index ] );
      }
    }
  },

  slice( length ) {
    if ( length === undefined ) {
      length = this.length;
    }

    if ( !length ) {
      return Buffer.from( [] )
    }

    if ( length > this.length ) {
      length = this.length;
    }

    let to;

    if ( length ) {
      to = this.at( length );
    }

    if ( !to ) {
      to = {
        index: this.length - 1,
        nodeIndex: this._buffer.length - 1
      };
    }

    const buffer = Buffer.from( Array( length ) );

    const offset = this._buffer.slice( to.nodeIndex - 1 )
      .reduce( ( offset, node ) => {
        buffer.set( node.chunk, offset );
        return offset + node.chunk.length
      }, 0 );

    if ( offset < length ) {
      const node = this._buffer[ to.nodeIndex ];

      buffer.set( node.chunk.slice( 0, length - offset ), offset );
    }

    return buffer
  },

  buffer( length ) {
    if ( length === undefined ) {
      length = this.length;
    }

    if ( !length ) {
      return Buffer.from( [] )
    }

    if ( length > this.length ) {
      length = this.length;
    }

    let to;

    if ( length ) {
      // console.time('at')
      to = this.at( length );
      // console.timeEnd('at')
    }

    if ( !to ) {
      to = {
        index: this.length - 1,
        nodeIndex: this._buffer.length - 1
      };
    }
    // console.time('from')
    const buffer = Buffer.from( Array( length ) );
    // console.timeEnd('from')
    // console.time('offset')

    // console.timeEnd('buffer')

    const offset = this.nodes( to.nodeIndex )
      .reduce( ( offset, node ) => {
        buffer.set( node.chunk, offset );
        return offset + node.chunk.length
      }, 0 );
    // console.timeEnd('offset')

    if ( offset < length ) {
      const node = this.nodes( 1 )[ 0 ];

      buffer.set( node.chunk.slice( 0, length - offset ), offset );
      if ( length - offset < node.chunk.length ) {
        node.chunk = node.chunk.slice( length - offset );

        this.unshift( node.chunk );
      }
    }

    return buffer
  }
};

function series( arr, cb, done ) {
  let i = 0;
  let aborted = false;
  ( function next( res ) {
    if ( !aborted ) {
      if ( typeof res !== 'undefined' || i >= arr.length ) {
        done && done( res );
      } else {
        setImmediate( () => {
          try {
            cb( next, arr[ i ], i++, arr );
          } catch ( err ) {
            next( err );
            aborted = true;
          }
        } );
      }
    }
  } )();
}

const DEFAULT_HIGHWATERMARK = 64;

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
  this._busState.active = 0;
  this.emit( 'inactive' );
}

function _decrementActive() {
  if ( !--this._busState.active ) {
    this.emit( 'inactive' );
  }
}

function _found( watcher ) {
  const {
    _busState
  } = this;
  const {
    watching
  } = _busState;
  const chunk = _busState.buffer( watcher.length );
  _busState.nodeIndex = -1;
  try {
    // console.time( 'cb' )
    watcher.callback(
      chunk,
      // frame.splice(-watcher.length),
      watcher
    );
    // console.timeEnd( 'cb' )
  } catch ( err ) {
    this.emit( 'error', err );
  }
  // _busState.watching = []
  // console.time( 'reset' )
  watching.forEach( _resetWatcher );
  _resetActive.call( this );
  // console.timeEnd( 'reset' )
}

function _nextPattern( watcher ) {
  if ( 1 + watcher.patternIndex < watcher.list.length ) {
    // console.time('next pattern')
    const nextPattern = watcher.list[ ++watcher.patternIndex /* patternIndex has already been incremented when checked condition */ ];
    watcher.byteIndex = 0;

    if ( typeof nextPattern == 'function' ) {
      try {
        watcher.currentPattern = nextPattern.call( this, this._busState.slice( 1 + watcher.length ) );
      } catch ( err ) {
        _resetWatcher( watcher );
        _decrementActive.call( this );
        this.emit( 'error', err );
      }
    } else {
      watcher.currentPattern = nextPattern;
    }
    // console.timeEnd('next pattern')
  } else {
    _found.call( this, watcher );
  }
}

function _push() {
  // console.log( '_push()' )
  const {
    _busState
  } = this;
  const {
    watching,
    _buffer
  } = _busState;

  for ( ; _busState.nodeIndex < _buffer.length; _busState.nodeIndex++ ) {
    if ( !watching.length ) {
      this.emit( 'error', {
        msg: 'Unexpected incoming data',
        data: _busState.buffer()
      } );
      return
    }

    if ( _busState.nodeIndex < 0 ) {
      _busState.nodeIndex = 0;
    }

    const {
      chunk
    } = _buffer[ _busState.nodeIndex ];
    let currentChunkIndex = 0;
    let watcherIndex = 0;
    let isEqual = false;
    if ( !_busState.active ) {
      _busState.active = _busState.watching.reduce( ( active, watcher ) => {
        const {
          list
        } = watcher;
        try {
          watcher.currentPattern = typeof list[ 0 ] == 'function' ? list[ 0 ].call( this, _busState.slice( watcher.length ) ) : list[ 0 ];
          watcher.active = true;
          return 1 + active
        } catch ( err ) {
          this.emit( 'error', err );
          return active
        }
      }, 0 );
    }

    for ( ; currentChunkIndex < chunk.length; currentChunkIndex++ ) {
      const byte = chunk[ currentChunkIndex ];

      for ( watcherIndex = 0; watcherIndex < watching.length; watcherIndex++, isEqual = false ) {
        const watcher = watching[ watcherIndex ];
        if ( !watcher.active ) {
          continue
        }

        const {
          currentPattern
        } = watcher;

        if ( Array.isArray( currentPattern ) || ArrayBuffer.isView( currentPattern ) ) {
          const expected = currentPattern[ watcher.byteIndex ];

          if ( expected === undefined || ( typeof expected == 'number' && expected === byte ) ) {
            isEqual = true;
          } else if ( typeof expected == 'function' ) {
            try {
              isEqual = !!expected.call( this, byte, watcher.length - 1 /*i.e. index*/ , _busState.slice( 1 + watcher.length /*i.e. actual length*/ ) );
            } catch ( err ) {
              this.emit( 'error', err );
            }
          }

          // if ( !isEqual ) {
          //   console.log( 'current watching:', watcher.currentPattern )
          //   console.log( 'current chunk:', chunk )
          //   console.log( 'byte:', byte )
          //   console.log( 'expected:', expected )
          // }

          if ( isEqual ) {
            ++watcher.length;

            if ( 1 + watcher.byteIndex < currentPattern.length ) {
              ++watcher.byteIndex;
            } else {
              _nextPattern.call( this, watcher );
            }
          } else {
            _resetWatcher( watcher );
            _decrementActive.call( this );

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
              } );
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
            watcher.offset = currentPattern;
          }

          watcher.length++;

            if ( --watcher.offset < 1 ) {
              _nextPattern.call( this, watcher );
            }
        } else {
          throw new TypeError( `Cannot parse pattern of ${ typeof currentPattern } type` )
        }
      }
    }
  }

  if ( _busState.active ) {
    this.emit( 'drain' );
  }
}

function _Bus$1( options = {} ) {
  this.transport = options.transport;
  this.type = options.type;
  this._setup = options.setup.bind( this );
  this._read = length => options.read.call( this, length === undefined ? length : this.options.highWaterMark );
  this._write = options.write.bind( this );

  this.options = {
    highWaterMark: options.highWaterMark || DEFAULT_HIGHWATERMARK
  };

  this._busState = new BufferState( {
    watching: [],
    active: 0,
    nodeIndex: 0,
    configured: false,
    ticker: false
  } );
}

_Bus$1.prototype = {
  setup() {
    if ( this._busState.configured ) {
      return Promise.reject( 'already configured' )
    }

    this._busState.configured = true;
    return this._setup.apply( this, arguments )
  },

  push( chunk ) {
    // console.log( 'push()' )
    // console.log( chunk )
    if ( chunk.length ) {
      this._busState.push( chunk );

      if ( !this._busState.ticker ) {
        this._busState.ticker = true;
        setImmediate( () => {
          this._busState.ticker = false;
          _push.call( this );
        } );
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
    } );

    this._busState.watching.push( watcher );

    return watcher
  },

  unwatch( watcher ) {
    if ( watcher ) {
      const index = this._busState.watching.indexOf( watcher );

      if ( index >= 0 ) {
        if ( this._busState.watching[ index ].active ) {
          _resetWatcher( watcher );
          _decrementActive.call( this );
        }

        this._busState.watching.splice( index, 1 );
      }
    } else {
      this._busState.watching.splice( 0 );
      _resetActive.call( this );
    }

    return this
  },

  /**
    @TODO Promise interface
  */

  expect( list, ...args ) {
    let cb, options = {};

    if ( typeof args[ 0 ] == 'function' ) {
      cb = args[ 0 ];
    } else if ( typeof args[ 1 ] == 'function' ) {
      cb = args[ 1 ];
      Object.assign( options, args[ 0 ] );
    } else {
      throw new ReferenceError( 'Callback is not provided' )
    }

    let watcher;
    const setWatcher = () => {
      watcher = this.watch( list, ( ...args ) => {
        this.unwatch( watcher );
        cb.apply( this, args );
      } );
      this._read( this.options.highWaterMark );
    };

    // if ( 'timeout' in options ) {
    //   setTimeout( setWatcher, options.timeout )
    // } else {
    //
    // }

    setWatcher();

    return watcher
  },

  send( binary, options = {} ) {
    if ( 'timeout' in options ) {
      setTimeout( () => {
        this._write( binary );
      }, options.timeout );
    } else {
      this._write( binary );
    }

    return this
  },

  reset() {
    this._busState.watching.splice( 0 );
    return this
  }
};

const Bus$1 = _extend( {
  proto: [ EventEmitter, _Bus$1 ],
  apply: [ EventEmitter, _Bus$1 ]
} );

var data$2 = { PN532_PREAMBLE:0,
  PN532_STARTCODE1:0,
  PN532_STARTCODE2:255,
  PN532_POSTAMBLE:0,
  PN532_HOST_TO_PN532:212,
  PN532_PN532_TO_HOST:213,
  PN532_COMMAND_DIAGNOSE:0,
  PN532_COMMAND_GETFIRMWAREVERSION:2,
  PN532_COMMAND_GETGENERALSTATUS:4,
  PN532_COMMAND_READREGISTER:6,
  PN532_COMMAND_WRITEREGISTER:8,
  PN532_COMMAND_READGPIO:12,
  PN532_COMMAND_WRITEGPIO:14,
  PN532_COMMAND_SETSERIALBAUDRATE:16,
  PN532_COMMAND_SETPARAMETERS:18,
  PN532_COMMAND_SAMCONFIGURATION:20,
  PN532_COMMAND_POWERDOWN:22,
  PN532_COMMAND_RFCONFIGURATION:50,
  PN532_COMMAND_RFREGULATIONTEST:88,
  PN532_COMMAND_INJUMPFORDEP:86,
  PN532_COMMAND_INJUMPFORPSL:70,
  PN532_COMMAND_INLISTPASSIVETARGET:74,
  PN532_COMMAND_INATR:80,
  PN532_COMMAND_INPSL:78,
  PN532_COMMAND_INDATAEXCHANGE:64,
  PN532_COMMAND_INCOMMUNICATETHRU:66,
  PN532_COMMAND_INDESELECT:68,
  PN532_COMMAND_INRELEASE:82,
  PN532_COMMAND_INSELECT:84,
  PN532_COMMAND_INAUTOPOLL:96,
  PN532_COMMAND_TGINITASTARGET:140,
  PN532_COMMAND_TGSETGENERALBYTES:146,
  PN532_COMMAND_TGGETDATA:134,
  PN532_COMMAND_TGSETDATA:142,
  PN532_COMMAND_TGSETMETADATA:148,
  PN532_COMMAND_TGGETINITIATORCOMMAND:136,
  PN532_COMMAND_TGRESPONSETOINITIATOR:144,
  PN532_COMMAND_TGGETTARGETSTATUS:138,
  PN532_COMMAND_WAKEUP:85,
  PN532_SPI_STATREAD:2,
  PN532_SPI_DATAWRITE:1,
  PN532_SPI_DATAREAD:3,
  PN532_SPI_READY:1,
  PN532_I2C_ADDRESS:36,
  PN532_I2C_READBIT:1,
  PN532_I2C_BUSY:0,
  PN532_I2C_READY:1,
  PN532_I2C_READYTIMEOUT:20,
  MIFARE_COMMAND_AUTH_A:96,
  MIFARE_COMMAND_AUTH_B:97,
  MIFARE_COMMAND_READ_16:48,
  MIFARE_COMMAND_WRITE_4:162,
  MIFARE_COMMAND_WRITE_16:160,
  MIFARE_COMMAND_TRANSFER:176,
  MIFARE_COMMAND_DECREMENT:192,
  MIFARE_COMMAND_INCREMENT:193,
  MIFARE_COMMAND_RESTORE:194,
  NDEF_URIPREFIX_NONE:0,
  NDEF_URIPREFIX_HTTP_WWWDOT:1,
  NDEF_URIPREFIX_HTTPS_WWWDOT:2,
  NDEF_URIPREFIX_HTTP:3,
  NDEF_URIPREFIX_HTTPS:4,
  NDEF_URIPREFIX_TEL:5,
  NDEF_URIPREFIX_MAILTO:6,
  NDEF_URIPREFIX_FTP_ANONAT:7,
  NDEF_URIPREFIX_FTP_FTPDOT:8,
  NDEF_URIPREFIX_FTPS:9,
  NDEF_URIPREFIX_SFTP:10,
  NDEF_URIPREFIX_SMB:11,
  NDEF_URIPREFIX_NFS:12,
  NDEF_URIPREFIX_FTP:13,
  NDEF_URIPREFIX_DAV:14,
  NDEF_URIPREFIX_NEWS:15,
  NDEF_URIPREFIX_TELNET:16,
  NDEF_URIPREFIX_IMAP:17,
  NDEF_URIPREFIX_RTSP:18,
  NDEF_URIPREFIX_URN:19,
  NDEF_URIPREFIX_POP:20,
  NDEF_URIPREFIX_SIP:21,
  NDEF_URIPREFIX_SIPS:22,
  NDEF_URIPREFIX_TFTP:23,
  NDEF_URIPREFIX_BTSPP:24,
  NDEF_URIPREFIX_BTL2CAP:25,
  NDEF_URIPREFIX_BTGOEP:26,
  NDEF_URIPREFIX_TCPOBEX:27,
  NDEF_URIPREFIX_IRDAOBEX:28,
  NDEF_URIPREFIX_FILE:29,
  NDEF_URIPREFIX_URN_EPC_ID:30,
  NDEF_URIPREFIX_URN_EPC_TAG:31,
  NDEF_URIPREFIX_URN_EPC_PAT:32,
  NDEF_URIPREFIX_URN_EPC_RAW:33,
  NDEF_URIPREFIX_URN_EPC:34,
  NDEF_URIPREFIX_URN_NFC:35,
  PN532_GPIO_VALIDATIONBIT:128,
  PN532_GPIO_P30:0,
  PN532_GPIO_P31:1,
  PN532_GPIO_P32:2,
  PN532_GPIO_P33:3,
  PN532_GPIO_P34:4,
  PN532_GPIO_P35:5,
  PN532_SAM_NORMAL_MODE:1,
  PN532_SAM_VIRTUAL_CARD:2,
  PN532_SAM_WIRED_CARD:3,
  PN532_SAM_DUAL_CARD:4,
  PN532_BRTY_ISO14443A:0,
  PN532_BRTY_ISO14443B:3,
  PN532_BRTY_212KBPS:1,
  PN532_BRTY_424KBPS:2,
  PN532_BRTY_JEWEL:4,
  NFC_WAIT_TIME:30,
  NFC_COMMAND_BUF_LEN:64,
  NFC_FRAME_ID_INDEX:6 };

var PN532_PREAMBLE = data$2.PN532_PREAMBLE;
var PN532_STARTCODE1 = data$2.PN532_STARTCODE1;
var PN532_STARTCODE2 = data$2.PN532_STARTCODE2;
var PN532_POSTAMBLE = data$2.PN532_POSTAMBLE;
var PN532_HOST_TO_PN532 = data$2.PN532_HOST_TO_PN532;
var PN532_PN532_TO_HOST = data$2.PN532_PN532_TO_HOST;















var PN532_COMMAND_INLISTPASSIVETARGET = data$2.PN532_COMMAND_INLISTPASSIVETARGET;


var PN532_COMMAND_INDATAEXCHANGE = data$2.PN532_COMMAND_INDATAEXCHANGE;























var MIFARE_COMMAND_AUTH_A = data$2.MIFARE_COMMAND_AUTH_A;

var MIFARE_COMMAND_READ_16 = data$2.MIFARE_COMMAND_READ_16;

var MIFARE_COMMAND_WRITE_16 = data$2.MIFARE_COMMAND_WRITE_16;



















































var PN532_BRTY_ISO14443A = data$2.PN532_BRTY_ISO14443A;
var PN532_BRTY_ISO14443B = data$2.PN532_BRTY_ISO14443B;

const check = values => !( 0xff & ( -values.reduce( ( sum, value ) => sum + value, 0 ) ) );

const LCS = ( byte, length, frame ) => check( frame.slice( -2 ) );

const CHECKSUM = ( byte, length, frame ) => check( frame.slice( 5 ) );

const BODY = frame => frame[ 3 ] - 1; /* response code + payload */

const INFO = [
  [ PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, undefined, LCS, PN532_PN532_TO_HOST ],
  BODY, [ CHECKSUM, PN532_POSTAMBLE ]
];



const ERR = [
  [ PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x01, 0xff, undefined, CHECKSUM, PN532_POSTAMBLE ]
];

const ACK = [
  new Uint8Array( [ PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x00, 0xff, PN532_POSTAMBLE ] )
];

const NACK = [
  new Uint8Array( [ PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0xff, 0x00, PN532_POSTAMBLE ] )
];

const command = command =>
  new Uint8Array( [
    PN532_PREAMBLE,
    PN532_STARTCODE1,
    PN532_STARTCODE2,
    0xff & ( command.length + 1 ),
    0xff & ( ~command.length ),
    PN532_HOST_TO_PN532,
    ...command,
    // checksum
    0xff & ( -command.reduce( ( checksum, byte ) => checksum + byte, PN532_HOST_TO_PN532 ) ),
    PN532_POSTAMBLE
  ] );

const parseInfo = chunk => {
  return {
    raw: chunk,
    code: chunk[ 6 ],
    body: chunk.slice( 7, 5 + chunk[ 3 ] )
  }
};

const parseBlockData = data => {
  if ( data.body.length == 1 ) {
    throw {
      cmd: data.code,
      code: data.body[ 0 ]
    }
  } else {
    return {
      chunk: data.body.slice( 1 )
    }
  }
};

function _Bus() {}

_Bus.prototype = {
  makeTransaction( cmd, info, parsers ) {
    return new Promise( ( done, fail ) => {
        // Don't be silly again - info frame refers to index from beginning, i.e. to ACK
        // this.expect([...ACK, ...info], chunk => done((parsers || [sliceAck, parseInfo]).reduce((data, parse) => parse(data), chunk)))
        this.expect( ACK, () => {
          this.expect( info, chunk => {
            const _parsers = parsers || [ parseInfo ];
            done( _parsers.reduce( ( data, parse ) => parse( data ), chunk ) );
          } );
        } );

        this.expect( NACK, fail );
        this.expect( ERR, fail );

        this.send( command( cmd ) );
      } )
      .catch( err => {
        this.unwatch();
        throw err
      } )
      .then( data => {
        this.unwatch();
        return data
      } )
  },

  findTargets( count, type ) {
    if ( type == 'A' ) {
      type = PN532_BRTY_ISO14443A;
    } else if ( type == 'B' ) {
      type = PN532_BRTY_ISO14443B;
    } else {
      throw new Error( 'Unknown ISO14443 type:', `"${ type }"` )
    }

    return this.makeTransaction( [
      PN532_COMMAND_INLISTPASSIVETARGET,
      count,
      type
    ], INFO, [ chunk => {
      const body = chunk.slice( 7, 5 + chunk[ 3 ] );
      const uid = body.slice( 6, 6 + body[ 5 ] );
      return {
        code: chunk[ 6 ],
        body,
        count: body[ 0 ],
        atqa: body.slice( 2, 4 ), // SENS_RES
        sak: body[ 4 ],
        uid
      }
    } ] )
  },

  authenticate( block, uid, key ) {
    return this.makeTransaction( [
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_COMMAND_AUTH_A,
      block,
      ...[].slice.call( key ),
      ...[].slice.call( uid )
    ], INFO )
  },

  readBlock( block ) {
    return this.makeTransaction( [
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_COMMAND_READ_16,
      block
    ], INFO, [ parseInfo, parseBlockData ] )
  },

  writeBlock( block, chunk ) {
    return this.makeTransaction( [
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_COMMAND_WRITE_16,
      block,
      ...[].slice.call( chunk )
    ], INFO )
  },

  readSector( sector ) {
    return new Promise( ( done, fail ) => {
      const readBlocksArr = [];
      for ( let block = sector * 4; block < sector * 4 + 3; block++ ) {
        readBlocksArr.push( block );
      }

      series( readBlocksArr, ( next, block, index ) => {
        this.readBlock( block )
          .then( data => {
            readBlocksArr[ index ] = data;
            next();
          } )
          .catch( err => {
            console.log( '!!!' );
            next( err );
          } );
      }, err => err ? fail( err ) : done( readBlocksArr ) );
    } )
  },

  writeSector( start, chunk ) {

  }
};

var Bus = _extend( {
  proto: [ Bus$1, _Bus ],
  apply: [ Bus$1, _Bus ]
} );

const transport = {
  buffer: Buffer.from( [] ),
  read( length ) {
    const chunk = this.buffer.slice( 0, length );
    this.buffer = Buffer.from( this.buffer, length );
    return chunk
  },

  write( chunk ) {
    this.buffer = Buffer.concat( [ this.buffer, Buffer.from( chunk ) ] );
  }
};

const preamble = [ 1, 2, 3 ];
const postamble = new Uint8Array( [ 4, 5, 6 ] );

const bus = new Bus( {
  transport,
  read( length ) {
    const chunk = this.transport.read( length );

    this.push( chunk );
  },
  write( chunk ) {
    this.transport.write( chunk );
  },
  setup() {
    this.on( 'error', console.error );
    this.on( 'drain', console.log.bind( this, 'drain' ) );
  }
} );

bus.setup();

bus.expect( [
  6
  // preamble,
  // // 2,
  // postamble
], data => {
  console.warn( 'incoming', data );
} );

bus.push( preamble );
// bus.push([1, 2])
bus.push( postamble );
// bus.push('unexpected')
