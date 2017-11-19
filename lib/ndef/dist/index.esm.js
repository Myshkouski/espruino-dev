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

/**
  * decode text bytes from ndef record payload
  *
  * @returns a string
  */
var decode = function decode(data) {
    var languageCodeLength = data[0] & 0x3F,
        // 6 LSBs
    languageCode = data.slice(1, 1 + languageCodeLength),
        utf16 = (data[0] & 0x80) !== 0; // assuming UTF-16BE

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

    protocolCode = protocols.indexOf(prefix);
    encoded = Buffer.from([protocolCode].concat([].slice.call(Buffer.from(uri.slice(prefix.length)))));

    return encoded;
};

// ndef.js
// Copyright 2013 Don Coleman
//
// This code is from phonegap-nfc.js https://github.com/don/phonegap-nfc

// see android.nfc.NdefRecord for documentation about constants
// http://developer.android.com/reference/android/nfc/NdefRecord.html

// convert bytes to a String
var s = function s(bytes) {
  return Buffer.from(bytes).toString();
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
    tnf = data.TNF_EMPTY;
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
var textRecord = function textRecord(text, languageCode, id) {
  return record(data.TNF_WELL_KNOWN, data.RTD_TEXT, id || [], encode(text, languageCode));
};

/**
 * Helper that creates a NDEF record containing a URI.
 *
 * @uri String
 * @id byte[] (optional)
 */
var uriRecord = function uriRecord(uri, id) {
  return record(data.TNF_WELL_KNOWN, data.RTD_URI, id || [], encode$1(uri));
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
var absoluteUriRecord = function absoluteUriRecord(uri, payload, id) {
  return record(data.TNF_ABSOLUTE_URI, uri, id || [], payload || []);
};

/**
* Helper that creates a NDEF record containing an mimeMediaRecord.
*
* @mimeType String
* @payload byte[]
* @id byte[] (optional)
*/
var mimeMediaRecord = function mimeMediaRecord(mimeType, payload, id) {
  return record(data.TNF_MIME_MEDIA, mimeType, id || [], payload || []);
};

/**
* Helper that creates an NDEF record containing an Smart Poster.
*
* @ndefRecords array of NDEF Records
* @id byte[] (optional)
*/
var smartPoster = function smartPoster(ndefRecords, id) {
  var payload = [];

  if (ndefRecords) {
    // make sure we have an array of something like NDEF records before encoding
    if (ndefRecords[0] instanceof Object && ndefRecords[0].hasOwnProperty('tnf')) {
      payload = encodeMessage(ndefRecords);
    } else {
      // assume the caller has already encoded the NDEF records into a byte array
      payload = ndefRecords;
    }
  } else {
    //console.warn("WARNING: Expecting an array of NDEF records")
    throw new Error('Expecting an array of NDEF records');
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

    if (header.me) {
      // last message
      break;
    }
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
var isType = function isType(record, tnf, type) {
  return record.tnf === tnf ? s(record) === s(type) : false;
};

// export const tnfToString = (tnf, value = tnf) => {
//   if(tnf == constants.TNF_EMPTY) {
//     value = "Empty"
//   }
//   else if(constants.TNF_WELL_KNOWN) {
//     value = "Well Known"
//   }
//   else if(constants.TNF_MIME_MEDIA) {
//     value = "Mime Media"
//   }
//   else if(constants.TNF_ABSOLUTE_URI) {
//     value = "Absolute URI"
//   }
//   else if(constants.TNF_EXTERNAL_TYPE) {
//     value = "External"
//   }
//   else if(constants.TNF_UNKNOWN) {
//     value = "Unknown"
//   }
//   else if(constants.TNF_UNCHANGED) {
//     value = "Unchanged"
//   }
//   else if(constants.TNF_RESERVED) {
//     value = "Reserved"
//   }
//   return value
// }

// Convert NDEF records and messages to strings
// This works OK for demos, but real code proably needs
// a custom implementation. It would be nice to make
// smarter record objects that can print themselves
// var stringifier = {
//     stringify: function (data, separator) {
//       if (Array.isArray(data)) {
//         if (typeof data[0] === 'number') {
//           // guessing this message bytes
//           data = decodeMessage(data)
//         }
//
//         return stringifier.printRecords(data, separator)
//       } else {
//         return stringifier.printRecord(data, separator)
//       }
//     },
//
//     // @message - NDEF Message (array of NDEF Records)
//     // @separator - line separator, optional, defaults to \n
//     // @returns string with NDEF Message
//     printRecords: function (message, separator) {
//
//         if(!separator) { separator = "\n" }
//         result = ""
//
//         // Print out the payload for each record
//         message.forEach(function(record) {
//             result += stringifier.printRecord(record, separator)
//             result += separator
//         })
//
//         return result.slice(0, (-1 * separator.length))
//     },
//
//     // @record - NDEF Record
//     // @separator - line separator, optional, defaults to \n
//     // @returns string with NDEF Record
//     printRecord: function (record, separator) {
//
//         var result = ""
//
//         if(!separator) { separator = "\n" }
//
//         switch(record.tnf) {
//             case ndef.constants.TNF_EMPTY:
//                 result += "Empty Record"
//                 result += separator
//                 break
//             case ndef.constants.TNF_WELL_KNOWN:
//                 result += stringifier.printWellKnown(record, separator)
//                 break
//             case ndef.constants.TNF_MIME_MEDIA:
//                 result += "MIME Media"
//                 result += separator
//                 result += s(record.type)
//                 result += separator
//                 result += s(record.payload) // might be binary
//                 break
//             case ndef.constants.TNF_ABSOLUTE_URI:
//                 result += "Absolute URI"
//                 result += separator
//                 result += s(record.type)    // the URI is the type
//                 result += separator
//                 result += s(record.payload) // might be binary
//                 break
//             case ndef.constants.TNF_EXTERNAL_TYPE:
//                 // AAR contains strings, other types could
//                 // contain binary data
//                 result += "External"
//                 result += separator
//                 result += s(record.type)
//                 result += separator
//                 result += s(record.payload)
//                 break
//             default:
//                 result += s("Can't process TNF " + record.tnf)
//         }
//
//         result += separator
//         return result
//     },
//
//     printWellKnown: function (record, separator) {
//
//         var result = ""
//
//         if (record.tnf !== ndef.constants.TNF_WELL_KNOWN) {
//             return "ERROR expecting TNF Well Known"
//         }
//
//         switch(record.type) {
//             case ndef.constants.RTD_TEXT:
//                 result += "Text Record"
//                 result += separator
//                 result += (ndef.text.decodePayload(record.payload))
//                 break
//             case ndef.constants.RTD_URI:
//                 result += "URI Record"
//                 result += separator
//                 result += (ndef.uri.decodePayload(record.payload))
//                 break
//             case ndef.constants.RTD_SMART_POSTER:
//                 result += "Smart Poster"
//                 result += separator
//                 // the payload of a smartposter is a NDEF message
//                 result += stringifier.printRecords(ndef.decodeMessage(record.payload))
//                 break
//             default:
//                 // attempt to display other types
//                 result += record.type + " Record"
//                 result += separator
//                 result += s(record.payload)
//         }
//
//         return result
//     }
// }
//
// export const stringify = { stringifier }

export { data as constants, record, textRecord, uriRecord, absoluteUriRecord, mimeMediaRecord, smartPoster, emptyRecord, androidApplicationRecord, encodeMessage, decodeMessage, decodeTnf, encodeTnf, isType };
