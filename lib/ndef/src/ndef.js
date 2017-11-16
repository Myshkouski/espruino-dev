// ndef.js
// Copyright 2013 Don Coleman
//
// This code is from phonegap-nfc.js https://github.com/don/phonegap-nfc

// see android.nfc.NdefRecord for documentation about constants
// http://developer.android.com/reference/android/nfc/NdefRecord.html

import CONSTANTS from './constants.yaml'

import {
  bytesToString,
  stringToBytes
} from './ndef-util'

import {
  encode as encodeTextPayload,
  decode as decodeTextPayload
} from './ndef-text'

import {
  encode as encodeUriPayload,
  decode as decodeUriPayload
} from './ndef-uri'

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
const s = bytes =>
  Buffer.from(bytes).toString()

export const record = (tnf = CONSTANTS.TNF_EMPTY, type = [], id = [], payload = [], value) => {
  // store type as String so it's easier to compare
  if(type instanceof Array) {
    type = bytesToString(type)
  }

  // in the future, id could be a String
  if (!(id instanceof Array)) {
    id = stringToBytes(id)
  }

  // Payload must be binary
  if (!(payload instanceof Array)) {
    payload = stringToBytes(payload)
  }

  // Experimental feature
  // Convert payload to text for Text and URI records
  if (tnf == CONSTANTS.TNF_WELL_KNOWN) {
    if(type == CONSTANTS.RTD_TEXT) {
      value = decodeTextPayload(payload)
    }
    else if(type == CONSTANTS.RTD_URI) {
      value = decodeUriPayload(payload)
    }
  }

  return {
    tnf,
    type,
    id,
    payload,
    value
  }
}

/**
 * Helper that creates an NDEF record containing plain text.
 *
 * @text String of text to encode
 * @languageCode ISO/IANA language code. Examples: “fi”, “en-US”, “fr-CA”, “jp”. (optional)
 * @id byte[] (optional)
 */
export const textRecord = (text, languageCode, id = []) =>
  record(CONSTANTS.TNF_WELL_KNOWN, CONSTANTS.RTD_TEXT, id, encodeTextPayload(text, languageCode))
/**
 * Helper that creates a NDEF record containing a URI.
 *
 * @uri String
 * @id byte[] (optional)
 */
export const uriRecord = (uri, id = []) =>
  record(CONSTANTS.TNF_WELL_KNOWN, CONSTANTS.RTD_URI, id, encodeUriPayload(uri))

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
export const absoluteUriRecord = (uri, payload = [], id = []) =>
  record(CONSTANTS.TNF_ABSOLUTE_URI, uri, id, payload)

/**
* Helper that creates a NDEF record containing an mimeMediaRecord.
*
* @mimeType String
* @payload byte[]
* @id byte[] (optional)
*/
export const mimeMediaRecord = (mimeType, payload = [], id = []) =>
  record(CONSTANTS.TNF_MIME_MEDIA, mimeType, id, payload)

/**
* Helper that creates an NDEF record containing an Smart Poster.
*
* @ndefRecords array of NDEF Records
* @id byte[] (optional)
*/
export const smartPoster = (ndefRecords, id, payload) => {
  payload = []

  if (ndefRecords) {
    // make sure we have an array of something like NDEF records before encoding
    if (ndefRecords[0] instanceof Object && ndefRecords[0].hasOwnProperty('tnf')) {
      payload = encodeMessage(ndefRecords)
    } else {
      // assume the caller has already encoded the NDEF records into a byte array
      payload = ndefRecords
    }
  } else {
    console.warn("WARNING: Expecting an array of NDEF records")
  }

  return record(CONSTANTS.TNF_WELL_KNOWN, CONSTANTS.RTD_SMART_POSTER, id, payload)
}

/**
* Helper that creates an empty NDEF record.
*
*/
export const emptyRecord = () =>
  record(CONSTANTS.TNF_EMPTY, [], [], [])

/**
* Helper that creates an Android Application Record (AAR).
* http://developer.android.com/guide/topics/connectivity/nfc/nfc.html#aar
*
*/
export const androidApplicationRecord = packageName =>
  record(CONSTANTS.TNF_EXTERNAL_TYPE, 'android.com:pkg', [], packageName)

/**
* Encodes an NDEF Message into bytes that can be written to a NFC tag.
*
* @ndefRecords an Array of NDEF Records
*
* @returns byte array
*
* @see NFC Data Exchange Format (NDEF) http://www.nfc-forum.org/specs/spec_list/
*/
export const encodeMessage = ndefRecords => {
  let encoded = [],
      tnf_byte,
      record_type,
      payload_length,
      id_length,
      i,
      mb, me, // messageBegin, messageEnd
      cf = false, // chunkFlag TODO implement
      sr, // boolean shortRecord
      il // boolean idLengthFieldIsPresent

  for (i = 0; i < ndefRecords.length; i++) {
    mb = (i === 0)
    me = (i === (ndefRecords.length - 1))
    sr = (ndefRecords[i].payload.length < 0xFF)
    il = (ndefRecords[i].id.length > 0)
    tnf_byte = encodeTnf(mb, me, cf, sr, il, ndefRecords[i].tnf)
    encoded.push(tnf_byte)

    // type is stored as String, converting to bytes for storage
    record_type = stringToBytes(ndefRecords[i].type)
    encoded.push(record_type.length)

    if (sr) {
      payload_length = ndefRecords[i].payload.length
      encoded.push(payload_length)
    } else {
      payload_length = ndefRecords[i].payload.length
      // 4 bytes
      encoded.push((payload_length >> 24))
      encoded.push((payload_length >> 16))
      encoded.push((payload_length >> 8))
      encoded.push((payload_length & 0xFF))
    }

    if (il) {
      id_length = ndefRecords[i].id.length
      encoded.push(id_length)
    }

    encoded = encoded.concat(record_type)

    if (il) {
      encoded = encoded.concat(ndefRecords[i].id)
    }

    encoded = encoded.concat(ndefRecords[i].payload)
  }

  return encoded
}

/**
* Decodes an array bytes into an NDEF Message
*
* @bytes an array bytes read from a NFC tag
*
* @returns array of NDEF Records
*
* @see NFC Data Exchange Format (NDEF) http://www.nfc-forum.org/specs/spec_list/
*/
export const decodeMessage = _bytes => {
  let bytes = _bytes.slice(0), // clone since parsing is destructive
      ndef_message = [],
      tnf_byte,
      header,
      type_length = 0,
      payload_length = 0,
      id_length = 0,
      record_type = [],
      id = [],
      payload = []

  while(bytes.length) {
    tnf_byte = bytes.shift()
    header = decodeTnf(tnf_byte)

    type_length = bytes.shift()

    if (header.sr) {
      payload_length = bytes.shift()
    } else {
      // next 4 bytes are length
      payload_length = ((0xFF & bytes.shift()) << 24) |
        ((0xFF & bytes.shift()) << 16) |
        ((0xFF & bytes.shift()) << 8) |
        (0xFF & bytes.shift())
    }

    if (header.il) {
      id_length = bytes.shift()
    }

    record_type = bytes.splice(0, type_length)
    id = bytes.splice(0, id_length)
    payload = bytes.splice(0, payload_length)

    ndef_message.push(
      record(header.tnf, record_type, id, payload)
    )

    if (header.me) break // last message
  }

  return ndef_message
}

/**
* Decode the bit flags from a TNF Byte.
*
* @returns object with decoded data
*
*  See NFC Data Exchange Format (NDEF) Specification Section 3.2 RecordLayout
*/
export const decodeTnf = tnf_byte => {
  return {
    mb: (tnf_byte & 0x80) !== 0,
    me: (tnf_byte & 0x40) !== 0,
    cf: (tnf_byte & 0x20) !== 0,
    sr: (tnf_byte & 0x10) !== 0,
    il: (tnf_byte & 0x8) !== 0,
    tnf: (tnf_byte & 0x7)
  }
}

/**
* Encode NDEF bit flags into a TNF Byte.
*
* @returns tnf byte
*
*  See NFC Data Exchange Format (NDEF) Specification Section 3.2 RecordLayout
*/
export const encodeTnf = (mb, me, cf, sr, il, tnf, value = tnf) => {
  if (mb) {
    value = value | 0x80
  }

  if (me) {
    value = value | 0x40
  }

  // note if cf: me, mb, li must be false and tnf must be 0x6
  if (cf) {
    value = value | 0x20
  }

  if (sr) {
    value = value | 0x10
  }

  if (il) {
    value = value | 0x8
  }

  return value
}

// TODO test with byte[] and string
export const isType = (record, tnf, type) =>
  record.tnf === tnf
    ? s(record) === s(type)
    : false
/*
export const tnfToString = (tnf, value = tnf) => {
  if(tnf == CONSTANTS.TNF_EMPTY) {
    value = "Empty"
  }
  else if(CONSTANTS.TNF_WELL_KNOWN) {
    value = "Well Known"
  }
  else if(CONSTANTS.TNF_MIME_MEDIA) {
    value = "Mime Media"
  }
  else if(CONSTANTS.TNF_ABSOLUTE_URI) {
    value = "Absolute URI"
  }
  else if(CONSTANTS.TNF_EXTERNAL_TYPE) {
    value = "External"
  }
  else if(CONSTANTS.TNF_UNKNOWN) {
    value = "Unknown"
  }
  else if(CONSTANTS.TNF_UNCHANGED) {
    value = "Unchanged"
  }
  else if(CONSTANTS.TNF_RESERVED) {
    value = "Reserved"
  }
  return value
}
*/

// Convert NDEF records and messages to strings
// This works OK for demos, but real code proably needs
// a custom implementation. It would be nice to make
// smarter record objects that can print themselves
var stringifier = {
    stringify: function (data, separator) {
      if (data instanceof Array) {
        if (typeof data[0] === 'number') {
          // guessing this message bytes
          data = decodeMessage(data)
        }

        return stringifier.printRecords(data, separator)
      } else {
        return stringifier.printRecord(data, separator)
      }
    },

    // @message - NDEF Message (array of NDEF Records)
    // @separator - line separator, optional, defaults to \n
    // @returns string with NDEF Message
    printRecords: function (message, separator) {

        if(!separator) { separator = "\n" }
        result = ""

        // Print out the payload for each record
        message.forEach(function(record) {
            result += stringifier.printRecord(record, separator)
            result += separator
        })

        return result.slice(0, (-1 * separator.length))
    },

    // @record - NDEF Record
    // @separator - line separator, optional, defaults to \n
    // @returns string with NDEF Record
    printRecord: function (record, separator) {

        var result = ""

        if(!separator) { separator = "\n" }

        switch(record.tnf) {
            case ndef.CONSTANTS.TNF_EMPTY:
                result += "Empty Record"
                result += separator
                break
            case ndef.CONSTANTS.TNF_WELL_KNOWN:
                result += stringifier.printWellKnown(record, separator)
                break
            case ndef.CONSTANTS.TNF_MIME_MEDIA:
                result += "MIME Media"
                result += separator
                result += s(record.type)
                result += separator
                result += s(record.payload) // might be binary
                break
            case ndef.CONSTANTS.TNF_ABSOLUTE_URI:
                result += "Absolute URI"
                result += separator
                result += s(record.type)    // the URI is the type
                result += separator
                result += s(record.payload) // might be binary
                break
            case ndef.CONSTANTS.TNF_EXTERNAL_TYPE:
                // AAR contains strings, other types could
                // contain binary data
                result += "External"
                result += separator
                result += s(record.type)
                result += separator
                result += s(record.payload)
                break
            default:
                result += s("Can't process TNF " + record.tnf)
        }

        result += separator
        return result
    },

    printWellKnown: function (record, separator) {

        var result = ""

        if (record.tnf !== ndef.CONSTANTS.TNF_WELL_KNOWN) {
            return "ERROR expecting TNF Well Known"
        }

        switch(record.type) {
            case ndef.RTD_TEXT:
                result += "Text Record"
                result += separator
                result += (ndef.text.decodePayload(record.payload))
                break
            case ndef.RTD_URI:
                result += "URI Record"
                result += separator
                result += (ndef.uri.decodePayload(record.payload))
                break
            case ndef.RTD_SMART_POSTER:
                result += "Smart Poster"
                result += separator
                // the payload of a smartposter is a NDEF message
                result += stringifier.printRecords(ndef.decodeMessage(record.payload))
                break
            default:
                // attempt to display other types
                result += record.type + " Record"
                result += separator
                result += s(record.payload)
        }

        return result
    }
}

//export const stringify = stringifier.stringify
