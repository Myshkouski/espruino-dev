'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var series = _interopDefault(require('helpers/series'));

Array.prototype.concat = function () {
  var concatenated = [];

  for (var i in this) {
    concatenated.push(this[i]);
  }

  for (var _i in arguments) {
    for (var j in arguments[_i]) {
      concatenated.push(arguments[_i][j]);
    }
  }

  return concatenated;
};

Object.assign = function (target) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  for (var _iterator = args, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var obj = _ref;

    if (obj instanceof Object) for (var key in obj) {
      target[key] = obj[key];
    }
  }

  return target;
};

Object.freeze = function (obj) {
  return obj;
};

var defProp = function defProp(obj, prop, desc) {
  try {
    Object.defineProperty(obj, prop, desc);
    return obj;
  } catch (e) {
    if (desc.get) obj.value = desc.get();else if (desc.value) obj[prop] = desc.value;

    return obj;
  }
};

var _named = (function (name, f) {
  defProp(f, 'name', { value: name });
  //defProp(f, 'toString', { value: () => '[Function' + (f.name !== undefined ? ': ' + f.name : '') + ']' })

  return f;
});

var SUPER_CHAIN_PROTO_PROP = '_super';
var SUPER_CHAIN_APPLY_PROP = '_apply';
var PROTOTYPE_IS_EXTENDED_PROP = '_isExtended';

var _copyChain = function _copyChain(Extended, ProtoChain, chainPropName, ignoreExtended) {
  //if chain on [Extended] has not been created yet
  if (!Extended.prototype[chainPropName]) defProp(Extended.prototype, chainPropName, { value: [] });

  ProtoChain.forEach(function (Proto) {
    //console.log(!!Proto.prototype['__extended__'], Proto)
    //if [Proto] has been '__extended__' and has same-named proto chain, copy the Proto chain to Extended chain
    var isExtended = !!Proto.prototype[PROTOTYPE_IS_EXTENDED_PROP],
        hasSameChain = !!Proto.prototype[chainPropName];

    var alreadyInChain = Extended.prototype[chainPropName].some(function (P) {
      return P === Proto;
    }),
        shouldBePushed = (!isExtended || !ignoreExtended) && !alreadyInChain,
        shouldCopyChain = isExtended && hasSameChain;

    if (shouldCopyChain) Proto.prototype[chainPropName].forEach(function (Proto) {
      //avoid pushing twice
      if (!Extended.prototype[chainPropName].some(function (P) {
        return P === Proto;
      })) {
        //console.log('pushed', Proto)
        Extended.prototype[chainPropName].push(Proto);
      }
    });

    if (shouldBePushed) Extended.prototype[chainPropName].push(Proto);
  });

  //console.log(Extended.prototype[chainPropName])
};

var _extend = function _extend() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!options.apply) options.apply = [];
  if (!options.super) options.super = [];
  if (!options.static) options.static = [];

  var Child = options.super[0];

  if (!options.name) options.name = Child.name;

  function Extended() {
    var _this = this,
        _arguments = arguments;

    Extended.prototype[SUPER_CHAIN_APPLY_PROP].forEach(function (Super) {
      if (Super !== Extended) {
        Super.apply(_this, _arguments);
      }
    });
  }

  _named(options.name, Extended);

  for (var i in options.static) {
    for (var prop in options.static[i]) {
      if ('prototype' != prop) {
        defProp(Extended, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        });
      }
    }
  }

  defProp(Extended, 'prototype', { value: {} });
  defProp(Extended.prototype, 'constructor', { value: Child });
  defProp(Extended.prototype, PROTOTYPE_IS_EXTENDED_PROP, { value: true });

  for (var _i in options.super) {
    var Proto = function Proto() {};

    Proto.prototype = options.super[_i].prototype;
    var _proto = new Proto();

    for (var _prop in _proto) {
      if (['constructor', PROTOTYPE_IS_EXTENDED_PROP, SUPER_CHAIN_PROTO_PROP, SUPER_CHAIN_APPLY_PROP].indexOf(_prop) < 0) {
        defProp(Extended.prototype, _prop, {
          value: _proto[_prop],
          enumerable: true,
          writable: true
        });
      }
    }
  }

  _copyChain(Extended, options.super, SUPER_CHAIN_PROTO_PROP, false);
  _copyChain(Extended, options.apply, SUPER_CHAIN_APPLY_PROP, true);

  return Extended;
};

var timers = {};

function time(label) {
  timers[label] = Date.now();
}

function timeEnd(label) {
  if (label in timers) {
    console.log(label + ': ' + (Date.now() - timers[label]).toFixed(3) + 'ms');
    delete timers[label];
  }
}

if (typeof console.time !== 'function') {
  console.time = time;
  console.timeEnd = timeEnd;
}

if (typeof console.error !== 'function') {
  console.error = console.log;
}

var TYPED_ARRAY_TYPES = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];

function Buffer() {
	throw new Error('Buffer constructor is deprecated. Use Buffer.from() instead.');
}

Buffer.from = function _createBuffer() {
	var _arguments = arguments;

	var iterable = [];
	if (typeof arguments[0] == 'string') {
		for (var c in arguments[0]) {
			iterable[c] = arguments[0].charCodeAt(c);
			/*iterable[c] = (arguments[0][c] >= 0x20 && arguments[0][c] <= 0x7F)
   	? arguments[0].charCodeAt(c)
   	: 0x00*/
		}
	} else if (arguments[0] instanceof Array || TYPED_ARRAY_TYPES.some(function (Proto$$1) {
		return _arguments[0] instanceof Proto$$1;
	})) {
		iterable = arguments[0];
	}

	if ('1' in arguments) {
		var offset = arguments[1] !== undefined ? arguments[1] : 0,
		    length = arguments[2] !== undefined ? arguments[2] : iterable.length,
		    array = [];

		for (var i = offset; i--;) {
			array[i] = 0;
		}for (var _i = 0; _i < iterable.length && _i < length; _i++) {
			array[offset + _i] = iterable[_i];
		}for (var _i2 = array.length; _i2 < length; _i2++) {
			array[_i2] = 0;
		}return new Uint8Array(array);
	}

	return new Uint8Array(iterable);
};

Buffer.concat = function concat() {
	var list = arguments[0] || [],
	    totalLength = arguments[1] !== undefined ? arguments[1] : list.reduce(function (totalLength, array) {
		return totalLength + array.length;
	}, 0);

	var buffer = Buffer.from([], 0, totalLength),
	    offset = 0;

	list.forEach(function (buf) {
		buffer.set(buf, offset);
		offset += buf.length;
	});

	return buffer;
};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var dist = createCommonjsModule(function (module, exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', { value: true });

  var data = { TNF_EMPTY: 0,
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

  // ndef-util.js
  // Copyright 2013 Don Coleman
  //

  // This is from phonegap-nfc.js and is a combination of helpers in nfc and util
  // https://github.com/chariotsolutions/phonegap-nfc/blob/master/www/phonegap-nfc.js

  var stringToBytes = function stringToBytes(string) {
    return Buffer.from(string);
  };

  function bytesToString(bytes) {
    return Buffer.from(bytes).toString();
  }

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

    return bytesToString(data.slice(languageCodeLength + 1));
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

    var encoded = stringToBytes(lang.length + lang + text);

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
    return prefix + bytesToString(data.slice(1));
  };

  /**
    * shorten a URI with standard prefix
    *
    * @returns an array of bytes
    */
  var encode$1 = function encode(uri) {
    var prefix, protocolCode, encoded;

    // check each protocol, unless we've found a match
    // "urn:" is the one exception where we need to keep checking
    // slice so we don't check ""
    protocols.slice(1).forEach(function (protocol) {
      if ((!prefix || prefix === "urn:") && uri.indexOf(protocol) === 0) {
        prefix = protocol;
      }
    });

    if (!prefix) {
      prefix = "";
    }

    encoded = stringToBytes(uri.slice(prefix.length));
    protocolCode = protocols.indexOf(prefix);
    // prepend protocol code
    encoded.unshift(protocolCode);

    return encoded;
  };

  // ndef.js
  // Copyright 2013 Don Coleman
  //
  // This code is from phonegap-nfc.js https://github.com/don/phonegap-nfc

  // see android.nfc.NdefRecord for documentation about constants
  // http://developer.android.com/reference/android/nfc/NdefRecord.html

  /**
   * Creates a JSON representation of a NDEF Record.
   *
   * @tnf 3-bit TNF (Type Name Format) - use one of the CONSTANTS.TNF_* constants
   * @type byte array, containing zero to 255 bytes, must not be null
   * @id byte array, containing zero to 255 bytes, must not be null
   * @payload byte array, containing zero to (2 ** 32 - 1) bytes, must not be null
   *
   * @returns JSON representation of a NDEF record
   *
   * @see Ndef.textRecord, Ndef.uriRecord and Ndef.mimeMediaRecord for examples
   */

  // convert bytes to a String
  var s = function s(bytes) {
    return Buffer.from(bytes).toString();
  };

  var record = function record() {
    var tnf = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : data.TNF_EMPTY;
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var payload = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    var value = arguments[4];

    // store type as String so it's easier to compare
    if (type instanceof Array) {
      type = bytesToString(type);
    }

    // in the future, id could be a String
    if (!(id instanceof Array)) {
      id = stringToBytes(id);
    }

    // Payload must be binary
    if (!(payload instanceof Array)) {
      payload = stringToBytes(payload);
    }

    // Experimental feature
    // Convert payload to text for Text and URI records
    if (tnf == data.TNF_WELL_KNOWN) {
      if (type == data.RTD_TEXT) {
        value = decode(payload);
      } else if (type == data.RTD_URI) {
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
  var textRecord = function textRecord(text, languageCode) {
    var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    return record(data.TNF_WELL_KNOWN, data.RTD_TEXT, id, encode(text, languageCode));
  };
  /**
   * Helper that creates a NDEF record containing a URI.
   *
   * @uri String
   * @id byte[] (optional)
   */
  var uriRecord = function uriRecord(uri) {
    var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    return record(data.TNF_WELL_KNOWN, data.RTD_URI, id, encode$1(uri));
  };

  /**
   * Helper that creates a NDEF record containing an absolute URI.
   *
   * An Absolute URI record means the URI describes the payload of the record.
   *
   * For example a SOAP message could use "http://schemas.xmlsoap.org/soap/envelope/"
   * as the type and XML content for the payload.
   *
   * Absolute URI can also be used to write LaunchApp records for Windows.
   *
   * See 2.4.2 Payload Type of the NDEF Specification
   * http://www.nfc-forum.org/specs/spec_list#ndefts
   *
   * Note that by default, Android will open the URI defined in the type
   * field of an Absolute URI record (TNF=3) and ignore the payload.
   * BlackBerry and Windows do not open the browser for TNF=3.
   *
   * To write a URI as the payload use ndef.uriRecord(uri)
   *
   * @uri String
   * @payload byte[] or String
   * @id byte[] (optional)
   */
  var absoluteUriRecord = function absoluteUriRecord(uri) {
    var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    return record(data.TNF_ABSOLUTE_URI, uri, id, payload);
  };

  /**
  * Helper that creates a NDEF record containing an mimeMediaRecord.
  *
  * @mimeType String
  * @payload byte[]
  * @id byte[] (optional)
  */
  var mimeMediaRecord = function mimeMediaRecord(mimeType) {
    var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    return record(data.TNF_MIME_MEDIA, mimeType, id, payload);
  };

  /**
  * Helper that creates an NDEF record containing an Smart Poster.
  *
  * @ndefRecords array of NDEF Records
  * @id byte[] (optional)
  */
  var smartPoster = function smartPoster(ndefRecords, id, payload) {
    payload = [];

    if (ndefRecords) {
      // make sure we have an array of something like NDEF records before encoding
      if (ndefRecords[0] instanceof Object && ndefRecords[0].hasOwnProperty('tnf')) {
        payload = encodeMessage(ndefRecords);
      } else {
        // assume the caller has already encoded the NDEF records into a byte array
        payload = ndefRecords;
      }
    } else {
      console.warn("WARNING: Expecting an array of NDEF records");
    }

    return record(data.TNF_WELL_KNOWN, data.RTD_SMART_POSTER, id, payload);
  };

  /**
  * Helper that creates an empty NDEF record.
  *
  */
  var emptyRecord = function emptyRecord() {
    return record(data.TNF_EMPTY, [], [], []);
  };

  /**
  * Helper that creates an Android Application Record (AAR).
  * http://developer.android.com/guide/topics/connectivity/nfc/nfc.html#aar
  *
  */
  var androidApplicationRecord = function androidApplicationRecord(packageName) {
    return record(data.TNF_EXTERNAL_TYPE, 'android.com:pkg', [], packageName);
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
      record_type = stringToBytes(ndefRecords[i].type);
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

      encoded = encoded.concat(ndefRecords[i].payload);
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
  var decodeMessage = function decodeMessage(_bytes) {
    var bytes = _bytes.slice(0),

    // clone since parsing is destructive
    ndef_message = [],
        tnf_byte = void 0,
        header = void 0,
        type_length = 0,
        payload_length = 0,
        id_length = 0,
        record_type = [],
        id = [],
        payload = [];

    while (bytes.length) {
      tnf_byte = bytes.shift();
      header = decodeTnf(tnf_byte);

      type_length = bytes.shift();

      if (header.sr) {
        payload_length = bytes.shift();
      } else {
        // next 4 bytes are length
        payload_length = (0xFF & bytes.shift()) << 24 | (0xFF & bytes.shift()) << 16 | (0xFF & bytes.shift()) << 8 | 0xFF & bytes.shift();
      }

      if (header.il) {
        id_length = bytes.shift();
      }

      record_type = bytes.splice(0, type_length);
      id = bytes.splice(0, id_length);
      payload = bytes.splice(0, payload_length);

      ndef_message.push(record(header.tnf, record_type, id, payload));

      if (header.me) break; // last message
    }

    return ndef_message;
  };

  /**
  * Decode the bit flags from a TNF Byte.
  *
  * @returns object with decoded data
  *
  *  See NFC Data Exchange Format (NDEF) Specification Section 3.2 RecordLayout
  */
  var decodeTnf = function decodeTnf(tnf_byte) {
    return {
      mb: (tnf_byte & 0x80) !== 0,
      me: (tnf_byte & 0x40) !== 0,
      cf: (tnf_byte & 0x20) !== 0,
      sr: (tnf_byte & 0x10) !== 0,
      il: (tnf_byte & 0x8) !== 0,
      tnf: tnf_byte & 0x7
    };
  };

  /**
  * Encode NDEF bit flags into a TNF Byte.
  *
  * @returns tnf byte
  *
  *  See NFC Data Exchange Format (NDEF) Specification Section 3.2 RecordLayout
  */
  var encodeTnf = function encodeTnf(mb, me, cf, sr, il, tnf) {
    var value = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : tnf;

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
  var isType = function isType(record, tnf, type) {
    return record.tnf === tnf ? s(record) === s(type) : false;
  };

  exports.record = record;
  exports.textRecord = textRecord;
  exports.uriRecord = uriRecord;
  exports.absoluteUriRecord = absoluteUriRecord;
  exports.mimeMediaRecord = mimeMediaRecord;
  exports.smartPoster = smartPoster;
  exports.emptyRecord = emptyRecord;
  exports.androidApplicationRecord = androidApplicationRecord;
  exports.encodeMessage = encodeMessage;
  exports.decodeMessage = decodeMessage;
  exports.decodeTnf = decodeTnf;
  exports.encodeTnf = encodeTnf;
  exports.isType = isType;
});

unwrapExports(dist);
var dist_2 = dist.textRecord;
var dist_9 = dist.encodeMessage;

//import Bus from 'bus'
//import { CONSTANTS, cmd } from '../lib/nfc'

var encoded = dist_9([dist_2('2enhello world!')]);

var decodeIterator = function decodeIterator(chunk, next, decoder, index$$1, decoders) {
  decoder(chunk, function (res) {
    if (++index$$1 < decoders.length) {
      next(res);
    } else {
      next(new Error({
        type: 'DecoderError',
        msg: 'Cannot decode chunk',
        chunk: chunk
      }));
    }
  });
};

function _Decoder() {
  this._decoderState = {
    receive: []
  };
}

_Decoder.prototype = {
  rx: function rx(decoder, cb) {
    this.receive.push({
      decoder: decoder, cb: cb
    });
  },
  /*
  tx(encoder, cb) {
  this.transmit.push({
    encoder, cb
  })
  },*/

  decode: function decode(chunk) {
    var _this = this;

    return new Promise(function (done, fail) {
      series(_this._decoderState.receive, function (next, decoder, index$$1, decoders) {
        decodeIterator(chunk, next, decoder, index$$1, decoders);
      }, function (err) {
        _this._decoderState.receive.splice(0);

        if (err) {
          fail(err);
        } else {
          done();
        }
      });
    });
  }
};

var Decoder = _extend({
  super: [Schedule],
  apply: [_Decoder, Schedule]
});

/*
const ndefRecord = [].concat([
  CONSTANTS.TAG_MEM_NDEF_TLV,
  encoded.length
], encoded, [
  CONSTANTS.TAG_MEM_TERMINATOR_TLV
])

function shrinkToUint8 (values) {
  return values.reduce((sum, value) => {
    sum += value

    while(sum > 0xff) {
      const remainder = sum & 0xff
      sum = sum >> 8
      sum += remainder - 1
    }
    return sum
  }, 0x00)
}

function LCS_std(byte, length, frame) {
  return 0x00 === shrinkToUint8(frame.slice(-2))
}

function LCS_ext(byte, length, frame) {
  return 0x00 === shrinkToUint8([frame[5] * 256 + frame[6], frame[7]])
}

function CHECKSUM_std(byte, length, frame) {
  return 0x00 === shrinkToUint8(frame.slice(5))
}

function CHECKSUM_ext(byte, length, frame) {
  return 0x00 === shrinkToUint8(frame.slice(8))
}

function BODY_std (frame) {
  const arr = []
  for(let i = 0; i < frame[3] - 1; i ++)
    arr.push(undefined)
  return arr
}

function BODY_ext (frame) {
  const arr = [], length = frame[5] * 256 + frame[6]
  for(let i = 0; i < length - 1; i ++)
    arr.push(undefined)
  return arr
}

const INFO_FRAME_std = [
  [0, 0, 0xff, undefined, LCS_std, 0xd5],
  BODY_std,
  [CHECKSUM_std, 0x00]
]

function createResponseNormalFrame (code) {
  return [
    [0, 0, 0xff, undefined, LCS_std, 0xd5, code],
    frame => BODY_std(frame).slice(1),
    [CHECKSUM_std, 0x00]
  ]
}

const INFO_FRAME_ext = [
  [0, 0, 0xff, 0xff, 0xff, undefined, undefined, LCS_ext, 0xd5],
  BODY_ext,
  [CHECKSUM_ext, 0x00]
]

const ERR_FRAME = [
  [0, 0 , 0xff, 0x01, 0xff, undefined, CHECKSUM_std, 0x00]
]

const ACK_FRAME = [
  new Uint8ClampedArray([0, 0, 255, 0, 255, 0])
]

const wakeup = new Uint8Array([0x55, 0x55, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
const sam = new Uint8Array(cmd([CONSTANTS.PN532_COMMAND_SAMCONFIGURATION, CONSTANTS.PN532_SAM_NORMAL_MODE, 20, 0]))
const writeGPIO = new Uint8Array(cmd([CONSTANTS.PN532_COMMAND_WRITEGPIO, 128, 128]))


function setup(done) {
  Serial1.setup(115200, {
    rx: B7, tx: B6
  })

  Serial1.write(wakeup)
  Serial1.write(sam)

  setTimeout(() => {
    Serial1.read()
    Serial1.pipe(this)
  }, 1000)

  setTimeout(() => {
    blink.once(LED2, 20, () => setTimeout(() => blink.once(LED2, 20), 200))

    done()
  }, 2000)
}

console.log(process.memory())

const bus = new Bus({
  setup, highWaterMark: 32
})

bus.on('error', console.error)

bus.setup(Serial1)
/*

bus.watch(ACK_FRAME, ack => {
  blink.once(LED2)
})

bus.watch(ERR_FRAME, err => {
  console.error('ERROR', {
    type: 'BusError',
    code: err[5]
  })

  bus.emit('error', {
    type: 'BusError',
    code: frame[5]
  })
})

bus.watch(INFO_FRAME_std, frame => {
  console.log('STD', {
    code: frame[6],
    body: frame.slice(7, 5 + frame[3])
  })
})

bus.watch(INFO_FRAME_ext, frame => {
  console.log('EXT', {
    code: frame[6],
    body: frame.slice(7, 5 + frame[3])
  })
})

bus.deferred(({ Serial1 }) => {
  const FIRMWARE = new Uint8Array(cmd([
    CONSTANTS.PN532_COMMAND_GETFIRMWAREVERSION,
  ]))

  Serial1.write(FIRMWARE)
})


const KEY = new Uint8ClampedArray([0xff, 0xff, 0xff, 0xff, 0xff, 0xff])
//let uid = new Uint8ClampedArray([ 0, 189, 157, 124 ])
var MIFARE_CMD_AUTH_A = 0x60;
var MIFARE_CMD_AUTH_B = 0x61;
var MIFARE_CMD_READ = 0x30;
var MIFARE_CMD_WRITE_16 = 0xA0;
const MIFARE_CMD_WRITE_4 = 0xA2

let afi = 0x00


/*
;(function poll() {
  let uid,
      block = 4,
      data = null

  bus.deferred(done => {
    const LIST = cmd([
      CONSTANTS.PN532_COMMAND_INLISTPASSIVETARGET,
      1,
      0
    ])

    bus.rx(ACK_FRAME, ack => {})

    bus.rx(INFO_FRAME_std, frame => {
      const body = frame.slice(7, 5 + frame[3]),
            uidLength = body[5],
            _uid = body.slice(6, 6 + uidLength)

      console.log('LIST', {
        code: frame[6],
        body,
        count: body[0],
        ATQA: body.slice(2, 4), // SENS_RES
        SAK: body[4],
        uidLength,
        uid: _uid
      })

      uid = _uid

      done()
    })

    Serial1.write(LIST)
  })

  bus.deferred((done, fail) => {
    const AUTH = cmd([
      CONSTANTS.PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_AUTH_A,
      block
    ].concat(KEY).concat(uid))

    bus.rx(ACK_FRAME, ack => {})

    //bus.rx(ERR_FRAME, fail)

    bus.rx(INFO_FRAME_std, frame => {
      console.log('AUTH', {
        code: frame[6],
        body: frame.slice(7, 5 + frame[3])
      })

      done()
    })

    Serial1.write(AUTH)
  })

  bus.deferred((done, fail) => {
    const WRITE = cmd([
      CONSTANTS.PN532_COMMAND_INDATAEXCHANGE,
      1,
      CONSTANTS.MIFARE_CMD_WRITE,
      block
    ].concat(encodeMessage))

    bus.rx(ACK_FRAME, ack => {
      console.log('ACK WRITE')
    })

    //bus.rx(ERR_FRAME, fail)

    bus.rx(INFO_FRAME_std, block => {
      console.log(block)

      done()
    })

    Serial1.write(WRITE)
  })

  bus.deferred((done, fail) => {
    const READ = cmd([
      CONSTANTS.PN532_COMMAND_INDATAEXCHANGE,
      1,
      CONSTANTS.MIFARE_CMD_READ,
      block
    ])

    bus.rx(ACK_FRAME, ack => {})

    //bus.rx(ERR_FRAME, fail)

    bus.rx(INFO_FRAME_std, block => {
      // Find NDEF TLV (0x03) in block of data - See NFC Forum Type 2 Tag Operation Section 2.4 (TLV Blocks)
      var ndefValueOffset = null;
      var ndefLength = null;
      var blockOffset = 0;

      while (ndefValueOffset === null) {
        if (blockOffset >= block.length) {
          throw new Error('Unable to locate NDEF TLV (0x03) byte in block:', block)
        }

        var type = block[blockOffset];       // Type of TLV
        var length = block[blockOffset + 1] || 0; // Length of TLV

        if (type === CONSTANTS.TAG_MEM_NDEF_TLV) {
          ndefLength = length;                  // Length proceeds NDEF_TLV type byte
          ndefValueOffset = blockOffset + 2;    // Value (NDEF data) proceeds NDEV_TLV length byte
        } else {
          // Skip TLV (type byte, length byte, plus length of value)
          blockOffset = blockOffset + 2 + length;
        }
      }

      var ndefData = block.slice(ndefValueOffset, block.length);
      var additionalBlocks = Math.ceil((ndefValueOffset + ndefLength) / 16) - 1;

      // Sequentially grab each additional 16-byte block (or 4x 4-byte pages) of data, chaining promises
      var self = this;
      var allDataPromise = (function retrieveBlock(blockNum) {
        if (blockNum <= additionalBlocks) {
          var blockAddress = 4 * (blockNum + 1);

          return self.readBlock({blockAddress: blockAddress})
            .then(function(block) {
              blockNum++;
              ndefData = Buffer.concat([ndefData, block]);
              return retrieveBlock(blockNum);
            });
        }
      })(1);

      done()

      allDataPromise.then(() => ndefData.slice(0, ndefLength));

    })

    Serial1.write(READ)
  })

  bus.deferred(done => {
    setTimeout(() => {
      done()
      poll()
    }, 1000)
  })
})()


/**/
