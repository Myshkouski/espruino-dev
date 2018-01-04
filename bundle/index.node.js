'use strict';

var data = { SUPER_CHAIN_PROTO_PROP:"_super",
  SUPER_CHAIN_APPLY_PROP:"_apply",
  PROTOTYPE_IS_EXTENDED_PROP:"_isExtended" };

var SUPER_CHAIN_PROTO_PROP = data.SUPER_CHAIN_PROTO_PROP;
var SUPER_CHAIN_APPLY_PROP = data.SUPER_CHAIN_APPLY_PROP;
var PROTOTYPE_IS_EXTENDED_PROP = data.PROTOTYPE_IS_EXTENDED_PROP;

const _copyChain = (Extended, ProtoChain, chainPropName, ignoreExtended) => {
  //if chain on [Extended] has not been created yet
  if(!Extended.prototype[chainPropName]) {
    Object.defineProperty(Extended.prototype, chainPropName, { value: [] });
  }

  ProtoChain.forEach(Proto => {
    //console.log(!!Proto.prototype['__extended__'], Proto)
    //if [Proto] has been '__extended__' and has same-named proto chain, copy the Proto chain to Extended chain
    const isExtended = !!Proto.prototype[PROTOTYPE_IS_EXTENDED_PROP],
          hasSameChain = !!Proto.prototype[chainPropName];

    const alreadyInChain = Extended.prototype[chainPropName].some(P => P === Proto),
          shouldBePushed = (!isExtended || !ignoreExtended) && !alreadyInChain,
          shouldCopyChain = isExtended && hasSameChain;

    if(shouldCopyChain)
      Proto.prototype[chainPropName].forEach(Proto => {
        //avoid pushing twice
        if(!Extended.prototype[chainPropName].some(P => P === Proto) ) {
          //console.log('pushed', Proto)
          Extended.prototype[chainPropName].push(Proto);
        }
      });

    if(shouldBePushed) {
      Extended.prototype[chainPropName].push(Proto);
    }
  });

  //console.log(Extended.prototype[chainPropName])
};

const _extend = (options = {}) => {
  if(!options.apply)
    options.apply = [];
  if(!options.super)
    options.super = [];
  if(!options.static)
    options.static = [];

  const Child = options.super[0];

  if(!options.name)
    options.name = Child.name;

  function Extended() {
    Extended.prototype[SUPER_CHAIN_APPLY_PROP].forEach(Super => {
      if(Super !== Extended) {
        Super.apply(this, arguments);
      }
    });
  }

  _named(options.name, Extended);

  for(let i in options.static) {
    for(let prop in options.static[i]) {
      if('prototype' != prop) {
        defProp(Extended, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        });
      }
    }
  }

  Object.defineProperty(Extended, 'prototype', { value: {} });
  Object.defineProperty(Extended.prototype, 'constructor', { value: Child });
  Object.defineProperty(Extended.prototype, PROTOTYPE_IS_EXTENDED_PROP, { value: true });

  for(let i in options.super) {
    function Proto() {}
    Proto.prototype = options.super[i].prototype;
    const proto = new Proto();

    for(let prop in proto) {
      if(['constructor', PROTOTYPE_IS_EXTENDED_PROP, SUPER_CHAIN_PROTO_PROP, SUPER_CHAIN_APPLY_PROP].indexOf(prop) < 0) {
        defProp(Extended.prototype, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        });
      }
    }
  }

  _copyChain(Extended, options.super, SUPER_CHAIN_PROTO_PROP, false);
  _copyChain(Extended, options.apply, SUPER_CHAIN_APPLY_PROP, true);

  return Extended
};

function EventEmitter() {
  this._listeners = {};
}

_named('EventEmitter', EventEmitter);

function _duplicateEvent(event) {
  if(event) {
    if(`#${ event }` in this) {
      this._listeners[event] = this[`#${ event }`];
    } else {
      delete this._listeners[event];
    }
  }
}

EventEmitter.prototype = {
  on(event, listener) {
    Object.prototype.on.call(this, event, listener);
    _duplicateEvent.call(this, event);

    // this._listeners[event]
    //   ? this._listeners[event].push(listener)
    //   : this._listeners[event] = [listener]

    return this
  },

  removeListener(event, listener) {
    Object.prototype.on.call(this, event, listener);
    _duplicateEvent.call(this, event);
    // if(!event) {
    //   this._listeners = {}
    // } else {
    //   if(listener && this._listeners[event]) {
    //     const index = this._listeners[event].indexOf(listener)
    //
    //     if(~index) {
    //       this._listeners[event].splice(index, 1)
    //     }
    //   }
    //
    //   if(!listener || !this._listeners[event]) {
    //     delete this._listeners[event]
    //   }
    // }
    return this
  },

  once(event, listener) {
    function once() {
      this.removeListener(event, _listener);
      return listener.apply(this, arguments)
    }

    return this.on(event, once)
  }
};

function Schedule() {
  this.pending = Promise.resolve(null);
}

Schedule.prototype = {
  immediate(task) {
    this.pending = Promise.all([
      this.pending,
      new Promise((done, fail) => {
        task(done, fail);
      }).catch(err => this.emit('error', err))
    ]);

    return this
  },

  deferred(task) {
    this.pending = this.pending
      .then(r => new Promise((done, fail) => {
        task(done, fail);
      }))
      .catch(err => this.emit('error', err));

    return this
  }
};

function series(arr, cb, done) {
  let i = 0;(function next(res) {
    if (res !== undefined || i >= arr.length) {
      done && done(res);
    }
    else {
      setImmediate(() => cb(next, arr[i], i++, arr));
    }
  })();
}

// import { Writable } from 'stream'
function _parse(chunk, encoding, cb) {
  const { incoming, watching, frame } = this._busState;

  let currentChunkIndex = 0,
      currentIncomingWatcherIndex = 0,
      incomingIndex = 0,
      isEqual = false;

  if(!watching.length) {
    this.emit('error', new Error({
      msg: 'Unexpected incoming data',
      data: chunk
    }));
  }
  else {
    for(;currentChunkIndex < chunk.length; currentChunkIndex ++) {
      frame.push(chunk[currentChunkIndex]);

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
            });
          } catch(err) {
            this.emit('error', err);
          }
        }
      }

      for(incomingIndex = 0; incomingIndex < incoming.length;) {
        const incomingI = incoming[incomingIndex],
              expected = incomingI.currentPattern[incomingI.byteIndex];

        if(expected === undefined || expected === chunk[currentChunkIndex]) {
          isEqual = true;

          incomingI.byteIndex ++;
        }
        else if(expected instanceof Array) {
          isEqual = true;

          if(incomingI.arrayOffset <= 0 && expected[0] > 0) {
            incomingI.arrayOffset = expected[0];
          }

          if(--incomingI.arrayOffset > 0) {
            continue
          }
          else {
            incomingI.byteIndex ++;
          }
        }
        else if(expected instanceof Function) {
          try {
            isEqual = !!expected.call(this, chunk[currentChunkIndex], incomingI.length, frame.slice(-incomingI.length - 1));
            incomingI.byteIndex ++;
          } catch(err) {
            this.emit('error', err);
            isEqual = false;
          }
        }
        else {
          isEqual = false;
        }

        if(isEqual) {
          incomingI.length ++;

          if(incomingI.byteIndex >= incomingI.currentPattern.length) {
            if(++ incomingI.patternIndex >= incomingI.patterns.length) {
              try {
                incomingI.callback.call(
                  this,
                  frame.splice(-incomingI.length),
                  incomingI.pattern
                );
              } catch(err) {
                this.emit('error', err);
              }

              incoming.splice(0);
              //break
            }
            else {
              const nextPattern = incomingI.patterns[incomingI.patternIndex];
              incomingI.byteIndex = 0;
              try {
                if(nextPattern instanceof Function) {
                  incomingI.currentPattern = nextPattern(frame.slice(-incomingI.length));
                }
                else {
                  incomingI.currentPattern = nextPattern;
                }
                incomingIndex ++;
              } catch(err) {
                this.emit('error', err);
                incoming.splice(incomingIndex, 1);
              }
            }
          }
          else {
            incomingIndex ++;
          }
        }
        else {
          incoming.splice(incomingIndex, 1);
        }
      }

      if(!incoming.length && frame.length) {
        this.emit('error', {
          msg: 'Unparsed chunk',
          data: frame.splice(0)
        });
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

  cb();
}

function _write(chunk, encoding, cb) {
  const highWaterMark = this.options.highWaterMark;

  if(chunk.length > highWaterMark) {
    const chunks = [];
    for(let bytesLeft = chunk.length, offset = 0; bytesLeft > 0; bytesLeft -= highWaterMark) {
      const subchunk = chunk.slice(offset, offset += highWaterMark);
      chunks.push(next => _parse.call(this, subchunk, encoding, next));
    }

    series(chunks, cb);
  }
  else {
    _parse.apply(this, arguments);
  }
}

function _Bus(options = {}) {
  Writable.call(this, Object.assign({}, options, {
    write: _write
  }));

  this._setup = options.setup.bind(this);

  this._busState = {
    watching: [],
    incoming: [],
    frame: [],
    configured: false
  };
}

_Bus.prototype = {
  setup (...args) {
    return this.deferred(slots => {
      if(this._busState.configured)
        return Promise.reject('already configured')

      this._busState.configured = true;
      return this._setup(slots, ...args)
    })
  },

  watch (patterns, callback) {
    const watcher = {
      patterns,
      callback
    };

    this._busState.watching.push(watcher);

    return watcher
  },

  unwatch (watcher) {
    if(watcher) {
      const index = this._busState.watching.indexOf(watcher);

      if(index >= 0)
        this._busState.watching.splice(index, 1);
    } else {
      this._busState.watching.splice(0);
    }

    return this
  },

  /**
    * @TODO - Proper unwatch(): delete all previously RXed watchers
    */
  rx(patterns, cb) {
    const watcher = this.watch(patterns, frame => {
      //this.unwatch(watcher)
      const index = this._busState.watching.indexOf(watcher);

      if(index >= 0)
        this._busState.watching.splice(0, index + 1);

      cb(frame);
    });

    return this
  },

  tx(binary, options = {}) {
    return this.deferred(() => {
      console.log('tx');
      if('timeout' in options) {
        return new Promise((done, fail) => {
          setTimeout(() => {
            this.write(binary);
            done();
          }, options.timeout);
        })
      }

      this.write(binary);

      return Promise.resolve()
    })
  },

  reset () {
    this._busState.frame.splice(0);
    this._busState.incoming.splice(0);
    return this
  }
};

const Bus = _extend({
  name: 'Bus',
  super: [Writable, Schedule, _Bus],
  apply: [_Bus, Schedule]
});

let status = false;
function blink(mode) {
  if(mode === undefined)
    mode = !status;

  !mode
    ? blink.stop()
    : blink.start();

  return !!status
}

blink.start = () => {
  if(!status) {
    status = true;

    blink.once(LED2, 20, function cb() {
      if(status) {
        setTimeout(() => blink.once(LED2, 20, cb), 980);
      }
    });
  }
};

blink.stop = () => {
  if(status) {
    status = false;
  }
};

blink.once = (led, on = 20, cb) => {
  led.write(true);
  setTimeout(() => {
    led.write(false);
    cb && cb();
  }, on);
};

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
  PN532_WAKEUP:85,
  PN532_SPI_STATREAD:2,
  PN532_SPI_DATAWRITE:1,
  PN532_SPI_DATAREAD:3,
  PN532_SPI_READY:1,
  PN532_I2C_ADDRESS:36,
  PN532_I2C_READBIT:1,
  PN532_I2C_BUSY:0,
  PN532_I2C_READY:1,
  PN532_I2C_READYTIMEOUT:20,
  PN532_MIFARE_ISO14443A:0,
  MIFARE_CMD_AUTH_A:96,
  MIFARE_CMD_AUTH_B:97,
  MIFARE_CMD_READ:48,
  MIFARE_CMD_WRITE_4:162,
  MIFARE_CMD_WRITE_16:160,
  MIFARE_CMD_TRANSFER:176,
  MIFARE_CMD_DECREMENT:192,
  MIFARE_CMD_INCREMENT:193,
  MIFARE_CMD_RESTORE:194,
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
  NFC_CMD_BUF_LEN:64,
  NFC_FRAME_ID_INDEX:6 };

var PN532_PREAMBLE = data$2.PN532_PREAMBLE;
var PN532_STARTCODE1 = data$2.PN532_STARTCODE1;
var PN532_STARTCODE2 = data$2.PN532_STARTCODE2;
var PN532_POSTAMBLE = data$2.PN532_POSTAMBLE;
var PN532_HOST_TO_PN532 = data$2.PN532_HOST_TO_PN532;
var PN532_PN532_TO_HOST = data$2.PN532_PN532_TO_HOST;









var PN532_COMMAND_SAMCONFIGURATION = data$2.PN532_COMMAND_SAMCONFIGURATION;





var PN532_COMMAND_INLISTPASSIVETARGET = data$2.PN532_COMMAND_INLISTPASSIVETARGET;


var PN532_COMMAND_INDATAEXCHANGE = data$2.PN532_COMMAND_INDATAEXCHANGE;













var PN532_WAKEUP = data$2.PN532_WAKEUP;










var MIFARE_CMD_AUTH_A = data$2.MIFARE_CMD_AUTH_A;

var MIFARE_CMD_READ = data$2.MIFARE_CMD_READ;
var MIFARE_CMD_WRITE_4 = data$2.MIFARE_CMD_WRITE_4;
















































var PN532_SAM_NORMAL_MODE = data$2.PN532_SAM_NORMAL_MODE;

const check = values => 0x00 == 0xff & values.reduce((sum, value) => sum += value, 0x00);

const LCS_std = (byte, length, frame) => check(frame.slice(-2));

const CHECKSUM_std = (byte, length, frame) => check(frame.slice(5));

const BODY_std = frame => {
  const arr = [];
  for(let i = 0; i < frame[3] - 1; i ++)
    arr.push(undefined);
  return arr
};

const INFO = [
  [PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, undefined, LCS_std, PN532_PN532_TO_HOST],
  BODY_std,
  [CHECKSUM_std, PN532_POSTAMBLE]
];





const ACK = [
  new Uint8ClampedArray([PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x00, 0xff, PN532_POSTAMBLE])
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
    ~(0xff & command.reduce((checksum, byte) => checksum += byte, 1 /** include PN532_HOST_TO_PN532 1 byte to length */)),
    PN532_POSTAMBLE
  ]);

var data$4 = { TNF_EMPTY: 0,
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
 * Creates a JSON representation of a NDEF Record.
 *
 * @tnf 3-bit TNF (Type Name Format) - use one of the constants.TNF_* constants
 * @type byte array, containing zero to 255 bytes, must not be null
 * @id byte array, containing zero to 255 bytes, must not be null
 * @payload byte array, containing zero to (2 ** 32 - 1) bytes, must not be null
 *
 * @returns JSON representation of a NDEF record
 *
 * @see Ndef.textRecord, Ndef.uriRecord and Ndef.mimeMediaRecord for examples
 */

var record = function record(tnf, type, id, payload, value) {
  if (!tnf) {
    tnf = data$4.TNF_EMPTY;
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
  if (tnf == data$4.TNF_WELL_KNOWN) {
    if (type == data$4.RTD_TEXT) {
      value = decode(payload);
    } else if (type == data$4.RTD_URI) {
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
  return record(data$4.TNF_WELL_KNOWN, data$4.RTD_TEXT, id || [], encode(text, languageCode));
};

/**
* Encodes an NDEF Message into bytes that can be written to a NFC tag.
*
* @ndefRecords an Array of NDEF Records
*
* @returns byte array
*
* @see NFC Data Exchange Format (NDEF) http://www.nfc-forum.org/specs/spec_list/
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
* Encode NDEF bit flags into a TNF Byte.
*
* @returns tnf byte
*
*  See NFC Data Exchange Format (NDEF) Specification Section 3.2 RecordLayout
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

blink();

const encoded = encodeMessage([
  textRecord('2enhello world!')
]);

const wakeup = command([PN532_WAKEUP]);
const sam = command([PN532_COMMAND_SAMCONFIGURATION, PN532_SAM_NORMAL_MODE, 20, 0]);




function setup(done) {
  Serial1.setup(115200, {
    rx: B7, tx: B6
  });

  Serial1.write(wakeup);
  Serial1.write(sam);

  setTimeout(() => {
    Serial1.read();
    Serial1.pipe(this);
  }, 1500);

  setTimeout(() => {
    blink.once(LED1, 20, () => setTimeout(() => blink.once(LED1, 20), 200));

    done();
  }, 2000);
}

const bus = new Bus({
  setup, highWaterMark: 64
});

bus.on('error', console.error);

bus.setup(Serial1);

const KEY = new Uint8ClampedArray([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

(function poll() {
  let uid,
      block = 4;

  bus.deferred(done => {
    const LIST = command([
      PN532_COMMAND_INLISTPASSIVETARGET,
      1,
      0
    ]);

    bus.rx(ACK, () => {
      console.log('ACK');
    });

    bus.rx(INFO, frame => {
      const body = frame.slice(7, 5 + frame[3]),
            uidLength = body[5],
            _uid = body.slice(6, 6 + uidLength);

      console.log('FOUND', {
        code: frame[6],
        body,
        count: body[0],
        ATQA: body.slice(2, 4), // SENS_RES
        SAK: body[4],
        uidLength,
        uid: _uid
      }['ATQA']);

      uid = _uid;

      done();
    });

    Serial1.write(LIST);
  });

  bus.deferred((done, fail) => {
    const AUTH = command([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_AUTH_A,
      block
    ].concat(KEY).concat(uid));

    bus.rx(ACK, ACK$$1 => {});

    bus.rx(ERR, fail);

    bus.rx(INFO, frame => {
      console.log('AUTH SUCCEED'/*, {
        code: frame[6],
        body: frame.slice(7, 5 + frame[3])
      }*/);

      done();
    });

    Serial1.write(AUTH);
  });

  bus.deferred((done, fail) => {
    const WRITE = command([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_WRITE_4,
      block
    ].concat(encoded));

    bus.rx(ACK, ACK$$1 => {});

    bus.rx(ERR, fail);

    bus.rx(INFO, block => {
      console.log('WRITE SUCCEED');

      done();
    });

    Serial1.write(WRITE);
  });

  bus.deferred((done, fail) => {
    const READ = command([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_READ,
      block
    ]);

    bus.rx(ACK, ACK$$1 => {});

    bus.rx(ERR, fail);

    bus.rx(INFO, block => {
      console.log("RED", block);

      done();
    });

    Serial1.write(READ);
  });

  bus.deferred(done => {
    setTimeout(() => {
      console.log(process.memory().free);
      done();
      poll();
    }, 1000);
  });
})();
