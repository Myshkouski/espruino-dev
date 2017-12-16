'use strict';

let status = false;
const defaultInterval = 20;
const defaultLed = LED2;

const once = ( led, on, cb ) => {
  led.write( 1 );
  setTimeout( () => {
    led.write( 0 );
    cb && cb();
  }, on || defaultInterval );
};

const start = led => {
  if ( !led ) {
    led = defaultLed;
  }
  if ( !status ) {
    status = true;

    once( led, defaultInterval, function cb() {
      if ( status ) {
        setTimeout( () => once( led, defaultInterval, cb ), 1000 - defaultInterval );
      }
    } );
  }
};

var data = { PN532_PREAMBLE:0,
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

var PN532_PREAMBLE = data.PN532_PREAMBLE;
var PN532_STARTCODE1 = data.PN532_STARTCODE1;
var PN532_STARTCODE2 = data.PN532_STARTCODE2;
var PN532_POSTAMBLE = data.PN532_POSTAMBLE;
var PN532_HOST_TO_PN532 = data.PN532_HOST_TO_PN532;
var PN532_PN532_TO_HOST = data.PN532_PN532_TO_HOST;









var PN532_COMMAND_SAMCONFIGURATION = data.PN532_COMMAND_SAMCONFIGURATION;





var PN532_COMMAND_INLISTPASSIVETARGET = data.PN532_COMMAND_INLISTPASSIVETARGET;


var PN532_COMMAND_INDATAEXCHANGE = data.PN532_COMMAND_INDATAEXCHANGE;













var PN532_COMMAND_WAKEUP = data.PN532_COMMAND_WAKEUP;









var MIFARE_COMMAND_AUTH_A = data.MIFARE_COMMAND_AUTH_A;

var MIFARE_COMMAND_READ_16 = data.MIFARE_COMMAND_READ_16;

var MIFARE_COMMAND_WRITE_16 = data.MIFARE_COMMAND_WRITE_16;















































var PN532_SAM_NORMAL_MODE = data.PN532_SAM_NORMAL_MODE;



var PN532_BRTY_ISO14443A = data.PN532_BRTY_ISO14443A;
var PN532_BRTY_ISO14443B = data.PN532_BRTY_ISO14443B;

const check = values => !(0xff & (-values.reduce((sum, value) => sum + value, 0)));

const LCS_std = (byte, length, frame) => check(frame.slice(-2));

const CHECKSUM_std = (byte, length, frame) => check(frame.slice(5));

const BODY_std = frame => {
  return [[frame[3] - 1]]
};

const INFO = [
  [PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, undefined, LCS_std, PN532_PN532_TO_HOST],
  BODY_std,
  [CHECKSUM_std, PN532_POSTAMBLE]
];



const ERR = [
  [PN532_PREAMBLE, PN532_STARTCODE1 , PN532_STARTCODE2, 0x01, 0xff, undefined, CHECKSUM_std, PN532_POSTAMBLE]
];

const ACK = [
  new Uint8ClampedArray([PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x00, 0xff, PN532_POSTAMBLE])
];

const NACK = [
  new Uint8ClampedArray([PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0xff, 0x00, PN532_POSTAMBLE])
];

const command = command =>
  new Uint8ClampedArray([
    PN532_PREAMBLE,
    PN532_STARTCODE1,
    PN532_STARTCODE2,
    0xff & (command.length + 1),
    0xff & (~command.length),
    PN532_HOST_TO_PN532,
    ...command,
    // checksum
    0xff & (-command.reduce((checksum, byte) => checksum + byte, PN532_HOST_TO_PN532)),
    PN532_POSTAMBLE
  ]);

function BufferState(options = {}) {
  Object.assign(this, {
		_buffer: [],
		length: 0
	}, options);
}

BufferState.prototype = {
  push(chunk) {
    if(chunk.length) {
      const node = {
    		chunk: Buffer.from(chunk),
        encoding: 'binary',
    		next: null
    	};

      if(this._buffer.length) {
        this._buffer[this._buffer.length - 1].next = node;
      }

      this._buffer.push(node);
      this.length += node.chunk.length;
    }

    return this.length
  },

  unshift(chunk) {
    const node = {
  		chunk: Buffer.from(chunk),
      encoding: 'binary',
  		next: null
  	};

    if(this._buffer.length) {
      node.next = this._buffer[0];
    }

    this._buffer.unshift(node);
    this.length += node.chunk.length;

    return this.length
  },

  nodes(count) {
    const nodes = this._buffer.splice(0, count);
    nodes.forEach(node => this.length -= node.chunk.length);

    return nodes
  },

  at(index) {
    if(index >= this.length || index < 0) {
      return
    }

    for(let nodeIndex = 0; nodeIndex < this._buffer.length; nodeIndex ++) {
      const chunk = this._buffer[nodeIndex].chunk;
      if(index < chunk.length) {
        return {
          index,
          nodeIndex,
          value: chunk[index]
        }
      }

      index -= chunk.length;
    }
  },

  for(from, to, callee) {
    const firstNode = this._buffer[from.nodeIndex];
    for(let index = from.nodeIndex; index < firstNode.chunk.length; index ++) {
      callee.call(this, firstNode.chunk[index]);
    }

    for(let nodeIndex = 1 + from.nodeIndex; nodeIndex < to.nodeIndex; nodeIndex ++) {
      const node = this._buffer[nodeIndex];
      for(let index = 0; index < node.chunk.length; index ++) {
        callee.call(this, node.chunk[index]);
      }
    }

    if(from.nodeIndex < to.nodeIndex) {
      const lastNode = this._buffer[to.nodeIndex];
      for(let index = 0; index <= to.index; index ++) {
        callee.call(this, lastNode.chunk[index]);
      }
    }
  },

  slice(length) {
    if(length === undefined) {
      length = this.length;
    }

    if(!length) {
      return Buffer.from([])
    }

    if(length > this.length) {
      length = this.length;
    }

    let to;

    if(length) {
      to = this.at(length);
    }

    if(!to) {
      to = {
        index: this.length - 1,
        nodeIndex: this._buffer.length - 1
      };
    }

    const buffer = Buffer.from([], 0, length);

    const offset = this._buffer.slice(0, to.nodeIndex).reduce((offset, node) => {
      buffer.set(node.chunk, offset);
      return offset + node.chunk.length
    }, 0);

    if(offset < length) {
      const node = this._buffer[to.nodeIndex];

      buffer.set(node.chunk.slice(0, length - offset), offset);
    }

    return buffer
  },

  buffer(length) {
    if(length === undefined) {
      length = this.length;
    }

    if(!length) {
      return Buffer.from([])
    }

    if(length > this.length) {
      length = this.length;
    }

    let to;

    if(length) {
      // console.time('at')
      to = this.at(length);
      // console.timeEnd('at')
    }

    if(!to) {
      to = {
        index: this.length - 1,
        nodeIndex: this._buffer.length - 1
      };
    }
    // console.time('from')
    const buffer = Buffer.from([], 0, length);
    // console.timeEnd('from')
    // console.time('offset')

    // console.timeEnd('buffer')
    const offset = this.nodes(to.nodeIndex).reduce((offset, node) => {
      buffer.set(node.chunk, offset);
      return offset + node.chunk.length
    }, 0);
    // console.timeEnd('offset')
    if(offset < length) {
      const node = this.nodes(1)[0];

      buffer.set(node.chunk.slice(0, length - offset), offset);
      node.chunk = node.chunk.slice(length - offset);

      this.unshift(node.chunk);
    }

    return buffer

    // return from.nodeIndex == to.nodeIndex
    //   ? this._buffer[from.nodeIndex].chunk.slice(from.index, to.index)
    //   : Buffer.concat([
    //       this._buffer[from.nodeIndex].chunk.slice(from.index),
    //       ...this._buffer.slice(1 + from.nodeIndex, to.nodeIndex).map(node => node.chunk),
    //       this._buffer[to.nodeIndex].chunk.slice(0, to.index)
    //     ])
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

//import { Writable } from 'stream'
const DEFAULT_HIGHWATERMARK = 64;
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
  watcher.currentPattern = null;
  watcher.arrayOffset =
    watcher.patternIndex =
    watcher.byteIndex =
    watcher.length = 0;
  watcher.active = false;
  return watcher

  // return Object.assign(watcher, defaultWatcher)
}

function _parse() {
  const {
    watching,
    frame,
    _buffer
  } = this._busState;

  if ( !watching.length ) {
    this.emit( 'error', {
      msg: 'Unexpected watching data',
      data: this._busState.buffer()
    } );
    return
  }

  if ( this._busState.nodeIndex < 0 ) {
    this._busState.nodeIndex = 0;
  }

  for ( ; this._busState.nodeIndex < _buffer.length; this._busState.nodeIndex++ ) {
    const {
      chunk
    } = _buffer[ this._busState.nodeIndex ];
    let currentChunkIndex = currentIncomingWatcherIndex = watcherIndex = 0,
      isEqual = isChunkCorrupted = false;

    for ( ; currentChunkIndex < chunk.length; currentChunkIndex++ ) {
      if ( !this._busState.active ) {
        this._busState.active = this._busState.watching.reduce( ( active, watcher ) => {
          const {
            patterns
          } = watcher;
          try {
            watcher.currentPattern = typeof patterns[ 0 ] == 'function' ? patterns[ 0 ]( Buffer.from( [] ) ) : patterns[ 0 ], watcher.active = true;
            return active + 1
          } catch ( err ) {
            this.emit( 'error', err );
            return active
          }
        }, 0 );
      }

      const byte = chunk[ currentChunkIndex ];

      for ( watcherIndex = 0; watcherIndex < watching.length; watcherIndex++, isEqual = false ) {
        const watcher = watching[ watcherIndex ];

        if ( !watcher.active ) {
          continue
        }

        const expected = watcher.currentPattern[ watcher.byteIndex ];

        // console.log('current watching:', watcher.currentPattern)
        // console.log('current chunk:', chunk)
        // console.log('byte:', byte)
        // console.log('expected:', expected)

        if ( expected === undefined || expected === byte ) {
          isEqual = true;
        } else if ( Array.isArray( expected ) ) {
          if ( watcher.arrayOffset <= 0 && expected[ 0 ] > 0 ) {
            watcher.arrayOffset = expected[ 0 ];
          }

          if ( --watcher.arrayOffset > 0 ) {
            watcher.length++;
              continue
          }

          isEqual = true;
        } else if ( typeof expected == 'function' ) {
          try {
            isEqual = !!expected.call( this, byte, watcher.length, this._busState.slice( 1 + watcher.length ) );
          } catch ( err ) {
            isEqual = false;
            this.emit( 'error', err );
          }
        }

        if ( isEqual ) {
          watcher.length++;

            if ( ++watcher.byteIndex >= watcher.currentPattern.length ) {
              if ( ++watcher.patternIndex >= watcher.patterns.length ) {
                console.time( 'buffer' );
                // console.log(watcher.callback)
                const chunk = this._busState.buffer( watcher.length );
                console.timeEnd( 'buffer' );
                this._busState.nodeIndex = -1;
                try {
                  console.time( 'cb' );
                  watcher.callback(
                    chunk,
                    // frame.splice(-watcher.length),
                    watcher.pattern
                  );
                  console.timeEnd( 'cb' );
                } catch ( err ) {
                  this.emit( 'error', err );
                }
                // this._busState.watching = []
                console.time( 'reset' );
                watching.forEach( _resetWatcher );
                this._busState.active = 0;
                console.timeEnd( 'reset' );
              } else {
                // console.time('next pattern')
                const nextPattern = watcher.patterns[ watcher.patternIndex ];
                watcher.byteIndex = 0;

                try {
                  if ( typeof nextPattern == 'function' ) {
                    watcher.currentPattern = nextPattern.call( this, this._busState.slice( watcher.length ) );
                  } else {
                    watcher.currentPattern = nextPattern;
                  }
                } catch ( err ) {
                  _resetWatcher( watcher );
                  this._busState.active--;

                    this.emit( 'error', err );
                }
                // console.timeEnd('next pattern')
              }
            }
        } else {
          _resetWatcher( watcher );
          this._busState.active--;

            if ( !watching.length && this._busState.length ) {
              this.emit( 'error', {
                msg: 'Unparsed chunk',
                data: this._busState.buffer() // frame.splice(0)
              } );
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
  this._setup = options.setup.bind( this );
  this._read = options.read.bind( this );
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

_Bus.prototype = {
  setup() {
    if ( this._busState.configured ) {
      return Promise.reject( 'already configured' )
    }

    this._busState.configured = true;
    return this._setup.apply( this, arguments )
  },

  parse( chunk ) {
    this._busState.push( chunk );

    if ( !this._busState.ticker ) {
      this._busState.ticker = true;
      setImmediate( () => {
        this._busState.ticker = false;
        _parse.call( this );
      } );
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
    } );

    this._busState.watching.push( watcher );

    return watcher
  },

  unwatch( watcher ) {
    if ( watcher ) {
      const index = this._busState.watching.indexOf( watcher );

      if ( index >= 0 ) {
        this._busState.watching.splice( index, 1 );
      }
    } else {
      this._busState.watching.splice( 0 );
    }

    return this
  },

  /**
    @TODO Promise interface
  */

  rx( patterns, cb ) {
    const watcher = this.watch( patterns, cb );
    this._read();
    return watcher
  },

  tx( binary, options = {} ) {
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

const parseInfo = chunk => {
  return {
    raw: chunk,
    code: chunk[ 6 ],
    body: Buffer.from( chunk.slice( 7, 5 + chunk[ 3 ] ) )
  }
};

const parseBlockData = data$$1 => {
  if ( data$$1.body.length == 1 ) {
    throw {
      cmd: data$$1.code,
      errCode: data$$1.body[ 0 ]
    }
  } else {
    return {
      chunk: data$$1.body.slice( 1 )
    }
  }
};

const NfcBus = {
  makeTransaction( cmd, info, parsers ) {
    return new Promise( ( done, fail ) => {
        // Don't be silly again - info frame refers to index from beginning, i.e. to ACK
        // this.rx([...ACK, ...info], chunk => done((parsers || [sliceAck, parseInfo]).reduce((data, parse) => parse(data), chunk)))
        this.rx( ACK, () => {
          this.rx( info, chunk => done( ( parsers || [ parseInfo ] )
            .reduce( ( data$$1, parse ) => parse( data$$1 ), chunk ) ) );
        } );

        this.rx( NACK, fail );
        this.rx( ERR, fail );

        this.tx( command( cmd ) );
      } )
      .catch( err => {
        this.unwatch();
        throw err
      } )
      .then( data$$1 => {
        this.unwatch();
        return data$$1
      } )
  },

  findTargets( count, type ) {
    if ( type == 'A' ) {
      type = PN532_BRTY_ISO14443A;
    } else if ( type == 'B' ) {
      type = PN532_BRTY_ISO14443B;
    } else {
      throw new Error( 'Unknown ISO14443 type:', type )
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
          .then( data$$1 => {
            readBlocksArr[ index ] = data$$1;
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

var Bus = options => Object.assign( new _Bus( options ), NfcBus );

var data$2 = { TNF_EMPTY: 0,
  TNF_WELL_KNOWN: 1,
  TNF_MIME_MEDIA: 2,
  TNF_ABSOLUTE_URI: 3,
  TNF_EXTERNAL_TYPE: 4,
  TNF_UNKNOWN: 5,
  TNF_UNCHANGED: 6,
  TNF_RESERVED: 7,
  RTD_TEXT: "T",
  RTD_URI: "U",
  RTD_SMART_POSTER: "Sp",
  RTD_ALTERNATIVE_CARRIER: "ac",
  RTD_HANDOVER_CARRIER: "Hc",
  RTD_HANDOVER_REQUEST: "Hr",
  RTD_HANDOVER_SELECT: "Hs",
  BLOCK_SIZE: 16,
  TLV_START: 64,
  TL_LENGTH: 4 };

/**
  * decode text bytes from ndef record payload
  *
  * @returns a string
  */
var decode = function decode(data) {
    var languageCodeLength = data[0] & 0x3F,
        // 6 LSBs
    languageCode = data.slice(1, 1 + languageCodeLength); // assuming UTF-16BE

    // TODO need to deal with UTF in the future
    // console.log("lang " + languageCode + (utf16 ? " utf16" : " utf8"))

    return Buffer.from(data.slice(languageCodeLength + 1)).toString();
};

/**
  * Encode text payload
  *
  * @returns an array of bytes
  */
var encode = function encode(text, lang, encoding) {
    // ISO/IANA language code, but we're not enforcing
    if (!lang) {
        lang = 'en';
    }

    var encoded = Buffer.from([lang.length].concat([].slice.call(Buffer.from(lang + text))));

    return encoded;
};

// URI identifier codes from URI Record Type Definition NFCForum-TS-RTD_URI_1.0 2006-07-24
// index in array matches code in the spec
var protocols = ["", "http://www.", "https://www.", "http://", "https://", "tel:", "mailto:", "ftp://anonymous:anonymous@", "ftp://ftp.", "ftps://", "sftp://", "smb://", "nfs://", "ftp://", "dav://", "news:", "telnet://", "imap:", "rtsp://", "urn:", "pop:", "sip:", "sips:", "tftp:", "btspp://", "btl2cap://", "btgoep://", "tcpobex://", "irdaobex://", "file://", "urn:epc:id:", "urn:epc:tag:", "urn:epc:pat:", "urn:epc:raw:", "urn:epc:", "urn:nfc:"];

/**
  * @returns a string
  */
var decode$1 = function decode(data) {
    var prefix = protocols[data[0]];
    if (!prefix) {
        // 36 to 255 should be ""
        prefix = "";
    }
    return prefix + Buffer.from(data.slice(1)).toString();
};

/**
  * shorten a URI with standard prefix
  *
  * @returns an array of bytes
  */
var record = function record(tnf, type, id, payload, value) {
  if (!tnf) {
    tnf = data$2.TNF_EMPTY;
  }
  if (!type) {
    type = [];
  }
  if (!id) {
    id = [];
  }
  if (!payload) {
    payload = [];
  }
  // store type as String so it's easier to compare
  if (type instanceof Array) {
    type = Buffer.from(type).toString();
  }

  // in the future, id could be a String
  if (!(id instanceof Array)) {
    id = Buffer.from(id);
  }

  // Payload must be binary
  if (!(payload instanceof Array)) {
    payload = Buffer.from(payload);
  }

  // Experimental feature
  // Convert payload to text for Text and URI records
  if (tnf == data$2.TNF_WELL_KNOWN) {
    if (type == data$2.RTD_TEXT) {
      value = decode(payload);
    } else if (type == data$2.RTD_URI) {
      value = decode$1(payload);
    }
  }

  return {
    tnf: tnf,
    type: type,
    id: id,
    payload: payload,
    value: value
  };
};

/**
 * Helper that creates an NDEF record containing plain text.
 *
 * @text String of text to encode
 * @languageCode ISO/IANA language code. Examples: “fi”, “en-US”, “fr-CA”, “jp”. (optional)
 * @id byte[] (optional)
 */
var textRecord = function textRecord(text, languageCode, id) {
  return record(data$2.TNF_WELL_KNOWN, data$2.RTD_TEXT, id || [], encode(text, languageCode));
};

/**
 * Helper that creates a NDEF record containing a URI.
 *
 * @uri String
 * @id byte[] (optional)
 */
var encodeMessage = function encodeMessage(ndefRecords) {
  var encoded = [],
      tnf_byte = void 0,
      record_type = void 0,
      payload_length = void 0,
      id_length = void 0,
      i = void 0,
      mb = void 0,
      me = void 0,
      // messageBegin, messageEnd
  cf = false,
      // chunkFlag TODO implement
  sr = void 0,
      // boolean shortRecord
  il = void 0; // boolean idLengthFieldIsPresent

  for (i = 0; i < ndefRecords.length; i++) {
    mb = i === 0;
    me = i === ndefRecords.length - 1;
    sr = ndefRecords[i].payload.length < 0xFF;
    il = ndefRecords[i].id.length > 0;
    tnf_byte = encodeTnf(mb, me, cf, sr, il, ndefRecords[i].tnf);
    encoded.push(tnf_byte);

    // type is stored as String, converting to bytes for storage
    record_type = [].slice.call(Buffer.from(ndefRecords[i].type));
    encoded.push(record_type.length);

    if (sr) {
      payload_length = ndefRecords[i].payload.length;
      encoded.push(payload_length);
    } else {
      payload_length = ndefRecords[i].payload.length;
      // 4 bytes
      encoded.push(payload_length >> 24);
      encoded.push(payload_length >> 16);
      encoded.push(payload_length >> 8);
      encoded.push(payload_length & 0xFF);
    }

    if (il) {
      id_length = ndefRecords[i].id.length;
      encoded.push(id_length);
    }

    encoded = encoded.concat(record_type);

    if (il) {
      encoded = encoded.concat(ndefRecords[i].id);
    }

    encoded = encoded.concat([].slice.call(ndefRecords[i].payload));
  }

  return encoded;
};

/**
* Decodes an array bytes into an NDEF Message
*
* @bytes an array bytes read from a NFC tag
*
* @returns array of NDEF Records
*
* @see NFC Data Exchange Format (NDEF) http://www.nfc-forum.org/specs/spec_list/
*/
var encodeTnf = function encodeTnf(mb, me, cf, sr, il, tnf, value) {
  if (!value) {
    value = tnf;
  }

  if (mb) {
    value = value | 0x80;
  }

  if (me) {
    value = value | 0x40;
  }

  // note if cf: me, mb, li must be false and tnf must be 0x6
  if (cf) {
    value = value | 0x20;
  }

  if (sr) {
    value = value | 0x10;
  }

  if (il) {
    value = value | 0x8;
  }

  return value;
};

// TODO test with byte[] and string

// import Bus from 'bus'
// import Schedule from 'schedule'
let usbConsole = true;
let consoleBus = null;
function toggleConsole() {
  usbConsole = !usbConsole;
  if ( usbConsole ) {
    consoleBus = null;
    USB.removeAllListeners();
  } else {
    consoleBus = new Bus( {
      setup() {
        USB.on( 'data', this.parse.bind( this ) );
      },
      read() {},
      write() {}
    } );

    consoleBus.watch( [ Buffer.from( '/on' ) ], () => {
      LED1.write( 1 );
      USB.write( '/on\r\n' );
    } );

    consoleBus.watch( [ Buffer.from( '/off' ) ], () => {
      LED1.write( 0 );
      USB.write( '/off\r\n' );
    } );

    consoleBus.on( 'error', err => {
      once( LED1, 200 );
    } );

    consoleBus.setup();
  }

  usbConsole ?
    USB.setConsole( false ) :
    LoopbackA.setConsole( false );
}

setWatch( toggleConsole, BTN1, {
  repeat: true,
  edge: 'rising',
  debounce: 50
} );

start( LED2 );

const encoded = encodeMessage( [
  textRecord( '2enhello world!' )
] );

const wakeup = command( [ PN532_COMMAND_WAKEUP ] );
const sam = command( [ PN532_COMMAND_SAMCONFIGURATION, PN532_SAM_NORMAL_MODE, 20, 0 ] );

function setup( done ) {
  Serial1.setup( 115200, {
    rx: B7,
    tx: B6
  } );

  Serial1.write( wakeup );
  Serial1.write( sam );

  setTimeout( () => {
    Serial1.read();
    Serial1.on( 'data', data => bus.parse( data ) );
    once( LED1, 20, () => setTimeout( () => once( LED1, 20 ), 200 ) );
  }, 50 );
}

const bus = new Bus( {
  setup,
  read() {},
  write( chunk ) {
    Serial1.write( chunk );
  },
  highWaterMark: 64
} );

bus.on( 'error', err => {
  console.error( 'BusError:', err );
} );

bus.setup();

const key = new Uint8Array( [].fill( 0xff, 0, 6 ) );

setTimeout( () => {
  ( function poll() {
    // console.log(process.memory().free)
    // console.log(bus._busState.watching.length)
    Promise.resolve()
      .then( () => bus.findTargets( 1, 'A' ) ) // .then(data => { console.log('found card', data.uid); return data })
      .then( data => {
        LED1.write( true );
        return data
      } )
      // .then(data => bus.authenticate(4, data.uid, key).then(data => { console.log('auth op 4:', data) }).then(() => bus.authenticate(3, data.uid, key).then(data => { console.log('auth op:', data) })))
      .then( data => bus.authenticate( 1 * 4, data.uid, key ) ) // .then(data => { console.log('auth', data) })
      // .then(data => bus.writeBlock(4, [1, 3, 6, 4])).then(data => { console.log('write op:', data) })
      // .then(data => { console.time('reading 2 sector'); return data })
      .then( data => bus.readSector( 1 ) )
      .then( data => {
        LED1.write( false );
        return data
      } ) // .then(data => { console.log('sector 2:', data); return data })
      .then( data => data.reduce( ( buffer, data ) => [ ...buffer, ...[].slice.call( data.chunk, 0 ) ], [] ) )
      .then( console.log )
      // .then(data => { console.timeEnd('reading 2 sector'); return data })
      // .then(data => bus.readBlock(4)).then(data => { console.log('block 4:', data) })
      // .then(data => bus.readBlock(5)).then(data => { console.log('block 5:', data) })
      // .then(data => bus.readBlock(6)).then(data => { console.log('block 6:', data) })
      // .then(data => bus.readBlock(7)).then(data => { console.log('block 7:', data) })
      .catch( err => {
        LED1.write( false );
        console.error( 'Error:', err );
      } )
      .then( () => {
        setTimeout( () => {
          poll();
        }, 500 );
      } );
  } )();
}, 1000 );
