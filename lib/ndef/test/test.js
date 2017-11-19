const assert = require("assert")
const ndef = require("../")

const textMessageHelloWorld = [ 209, 1, 15, 84, 2, 101, 110, 104, 101, 108, 108, 111,
            44, 32, 119, 111, 114, 108, 100 ]
const urlMessageNodeJSorg = [ 209, 1, 11, 85, 3, 110, 111, 100, 101, 106, 115, 46,
            111, 114, 103 ]
const absoluteUriWindowsLaunchRecord = [ 211, 21, 57, 119, 105, 110, 100, 111, 119, 115,
            46, 99, 111, 109, 47, 76, 97, 117, 110, 99, 104, 65, 112, 112, 0, 1, 12, 87,
            105, 110, 100, 111, 119, 115, 80, 104, 111, 110, 101, 38, 123, 102, 53, 56,
            55, 52, 50, 53, 50, 45, 49, 102, 48, 52, 45, 52, 99, 51, 102, 45, 97, 51, 51,
            53, 45, 52, 102, 97, 51, 98, 55, 98, 56, 53, 51, 50, 57, 125, 0, 1, 32]
const mimeMediaMessage = [ 210, 9, 27, 116, 101, 120, 116, 47, 106, 115, 111, 110,
            123, 34, 109, 101, 115, 115, 97, 103, 101, 34, 58, 32, 34, 104, 101, 108,
            108, 111, 44, 32, 119, 111, 114, 108, 100, 34, 125 ]
const multipleRecordMessage = [ 145, 1, 15, 84, 2, 101, 110, 104, 101, 108, 108, 111,
            44, 32, 119, 111, 114, 108, 100, 17, 1, 11, 85, 3, 110, 111, 100, 101,
            106, 115, 46, 111, 114, 103, 82, 9, 27, 116, 101, 120, 116, 47, 106, 115,
            111, 110, 123, 34, 109, 101, 115, 115, 97, 103, 101, 34, 58, 32, 34, 104,
            101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 34, 125 ]
const emptyMessage = [ 208, 0, 0 ]
const androidApplicationRecordMessage = [
    0xD4, 0x0F, 0x0E, 0x61, 0x6E, 0x64, 0x72, 0x6F, 0x69, 0x64, 0x2E, 0x63, 0x6F, 0x6D, 0x3A, 0x70,
    0x6B, 0x67, 0x63, 0x6F, 0x6D, 0x2E, 0x6C, 0x61, 0x75, 0x6E, 0x64, 0x72, 0x79, 0x6E, 0x66, 0x63
]
const threeEmptyMessage = [ 144, 0, 0, 16, 0, 0, 80, 0, 0 ]
const externalMessage = [
            0xD4, 0x0F, 0x03, 0x63, 0x6F, 0x6D, 0x2E, 0x65, 0x78, 0x61, 0x6D, 0x70, 0x6C, 0x65, 0x3A, 0x66,
            0x6F, 0x6F, 0x62, 0x61, 0x72 ]

describe('Encode Message', function() {

  describe('textRecord', function() {

    it('should match known message', function() {
      const message = [
        ndef.textRecord("hello, world")
      ]

      const encoded = ndef.encodeMessage(message)

      assert.deepEqual(textMessageHelloWorld, encoded)
    })
  })

  describe('uriRecord', function() {

    it('should match known message', function() {

      const message = [
        ndef.uriRecord("http://nodejs.org")
      ]

      const encoded = ndef.encodeMessage(message)

      assert.deepEqual(urlMessageNodeJSorg, encoded)
    })
  })

  describe('absoluteUriRecord', function() {

    it('should match known message', function() {

      // Windows LaunchApp Record to open Nokia Music App on Windows Phone 8

      // [00] 00 01 0C 57 69 6E 64 6F 77 73 50 68 6F 6E 65 26 |...WindowsPhone&|
      // [10] 7B 66 35 38 37 34 32 35 32 2D 31 66 30 34 2D 34 |{f5874252-1f04-4|
      // [20] 63 33 66 2D 61 33 33 35 2D 34 66 61 33 62 37 62 |c3f-a335-4fa3b7b|
      // [30] 38 35 33 32 39 7D 00 01 20                      |85329}.. |

      const payload = [
        0x00, 0x01, 0x0C, 0x57, 0x69, 0x6E, 0x64, 0x6F, 0x77, 0x73, 0x50, 0x68, 0x6F, 0x6E, 0x65, 0x26,
        0x7B, 0x66, 0x35, 0x38, 0x37, 0x34, 0x32, 0x35, 0x32, 0x2D, 0x31, 0x66, 0x30, 0x34, 0x2D, 0x34,
        0x63, 0x33, 0x66, 0x2D, 0x61, 0x33, 0x33, 0x35, 0x2D, 0x34, 0x66, 0x61, 0x33, 0x62, 0x37, 0x62,
        0x38, 0x35, 0x33, 0x32, 0x39, 0x7D, 0x00, 0x01, 0x20
      ]

      const message = [
        ndef.absoluteUriRecord("windows.com/LaunchApp", payload)
      ]

      const encoded = ndef.encodeMessage(message)

      assert.deepEqual(absoluteUriWindowsLaunchRecord, encoded)
    })
  })

  describe('mimeMediaRecord', function() {

    it('should match known message', function() {

      const message = [
        ndef.mimeMediaRecord("text/json", '{"message": "hello, world"}')
      ]

      const encoded = ndef.encodeMessage(message)

      assert.deepEqual(mimeMediaMessage, encoded)
    })
  })

  describe('emptyRecord', function() {

    it('should match known message', function() {

      const message = [
        ndef.emptyRecord()
      ]

      const encoded = ndef.encodeMessage(message)

      assert.deepEqual(emptyMessage, encoded)
    })
  })

  describe('androidApplicationRecord', function() {

    it('should match known message', function() {

      const packageName = "com.laundrynfc"
      const message = [
        ndef.androidApplicationRecord(packageName)
      ]

      const encoded = ndef.encodeMessage(message)

      assert.deepEqual(androidApplicationRecordMessage, encoded)
    })
  })

  describe('multipleEmptyRecords', function() {

    it('should match known message', function() {

      const message = [
        ndef.emptyRecord(),
        ndef.emptyRecord(),
        ndef.emptyRecord()
      ]

      const encoded = ndef.encodeMessage(message)

      assert.deepEqual(threeEmptyMessage, encoded)
    })
  })

  describe('multipleRecords', function() {

    it('should match known message', function() {

      const message = [
        ndef.textRecord("hello, world"),
        ndef.uriRecord("http://nodejs.org"),
        ndef.mimeMediaRecord("text/json", '{"message": "hello, world"}')
      ]

      const encoded = ndef.encodeMessage(message)

      assert.deepEqual(multipleRecordMessage, encoded)
    })
  })
})

describe('Decode Message', function() {

  describe('textRecord', function() {

    it('should match known record', function() {

      const decodedMessage = ndef.decodeMessage(textMessageHelloWorld)
      assert.equal(1, decodedMessage.length)

      const record = ndef.textRecord("hello, world")
      const decodedRecord = decodedMessage[0]

      assert.equal(record.tnf, decodedRecord.tnf)
      assert.equal(record.type, decodedRecord.type)
      assert.deepEqual(record.payload, decodedRecord.payload)
    })
  })

  describe('uriRecord', function() {

    it('should match known record', function() {

      const decodedMessage = ndef.decodeMessage(urlMessageNodeJSorg)
      assert.equal(1, decodedMessage.length)

      const record = ndef.uriRecord("http://nodejs.org")
      const decodedRecord = decodedMessage[0]

      assert.equal(record.tnf, decodedRecord.tnf)
      assert.equal(record.type, decodedRecord.type)
      assert.deepEqual(record.payload, decodedRecord.payload)

    })
  })

  it('should not be destructive', function() {

    let decodedMessage = ndef.decodeMessage(textMessageHelloWorld)
    assert.equal(1, decodedMessage.length)

    decodedMessage = ndef.decodeMessage(textMessageHelloWorld)
    assert.equal(1, decodedMessage.length)
  })

  it('should decode multiple records', function() {

    const decodedMessage = ndef.decodeMessage(multipleRecordMessage)
    assert.equal(3, decodedMessage.length)

    assert.equal(ndef.constants.TNF_WELL_KNOWN, decodedMessage[0].tnf)
    assert.equal(ndef.constants.RTD_TEXT, decodedMessage[0].type)
    assert.equal("hello, world", Buffer.from(decodedMessage[0].payload).slice(3))

    assert.equal(ndef.constants.TNF_WELL_KNOWN, decodedMessage[1].tnf)
    assert.equal(ndef.constants.RTD_URI, decodedMessage[1].type)
    assert.equal("nodejs.org", Buffer.from(decodedMessage[1].payload).slice(1)) // char 0 is 0x3 for http://

    assert.equal(ndef.constants.TNF_MIME_MEDIA, decodedMessage[2].tnf)
    assert.equal("text/json", Buffer.from(decodedMessage[2].type))
    assert.equal('{"message": "hello, world"}', Buffer.from(decodedMessage[2].payload))
  })

})

// describe('stringify', function() {
//
//     it ('should stringify messages', function() {
//         const message = [
//             ndef.textRecord("hello, world")
//         ]
//
//         const string = ndef.stringify(message)
//
//         assert.equal("Text Record\nhello, world\n", string)
//
//         message = [
//             ndef.uriRecord("http://www.example.com"),
//             ndef.textRecord("hello, world")
//         ]
//
//         string = ndef.stringify(message)
//
//         assert.equal("URI Record\nhttp://www.example.com\n\nText Record\nhello, world\n", string)
//     })
//
//     it ('should stringify smartposters', function() {
//         const message = [
//             ndef.smartPoster(
//                 [
//                     ndef.uriRecord("http://www.example.com"),
//                     ndef.textRecord("hello, world")
//                 ]
//             )
//         ]
//
//         const string = ndef.stringify(message)
//
//         // ideally the inner message would be indented
//         assert.equal("Smart Poster\nURI Record\nhttp://www.example.com\n\nText Record\nhello, world\n\n", string)
//     })
//
//     it ('should stringify records', function() {
//         const record = ndef.textRecord("hello, world")
//         const string = ndef.stringify(record)
//
//         assert.equal("Text Record\nhello, world\n", string)
//     })
//
//     it ('should reject invalid records', function() {
//
//         const record = ndef.record(17, [], [], [])
//         const string = ndef.stringify(record)
//
//         assert.equal("Can't process TNF 17\n", string)
//     })
//
//     it ('only handles some well known types', function() {
//
//         const record = ndef.record(ndef.constants.TNF_WELL_KNOWN, ndef.constants.RTD_HANDOVER_REQUEST,
//             [0x48, 0x72], [0x12,0x91,0x02,0x02,0x63,0x72,0xAA,0x0D,0x51,0x02,0x04,0x61,0x63,0x01,0x01,0x62,0x00])
//         const string = ndef.stringify(record)
//
//         assert.equal(0, string.indexOf("Hr Record"))
//     })
//
//     it ('should do something sensible with message bytes', function() {
//         const message = [
//             ndef.textRecord("hello, world")
//         ]
//
//         const bytes = ndef.encodeMessage(message)
//
//         const string = ndef.stringify(bytes)
//
//         assert.equal("Text Record\nhello, world\n", string)
//     })
//
//     it ('should handle empty array', function() {
//         const string = ndef.stringify([])
//         assert.equal("", string)
//     })
//
// })

// describe('TNF to String', function() {
//
//     it('should stringify known TNF', function() {
//         assert.equal(ndef.tnfToString(ndef.constants.TNF_EMPTY), "Empty")
//         assert.equal(ndef.tnfToString(ndef.constants.TNF_WELL_KNOWN), "Well Known")
//         assert.equal(ndef.tnfToString(ndef.constants.TNF_MIME_MEDIA), "Mime Media")
//         assert.equal(ndef.tnfToString(ndef.constants.TNF_ABSOLUTE_URI), "Absolute URI")
//         assert.equal(ndef.tnfToString(ndef.constants.TNF_EXTERNAL_TYPE), "External")
//         assert.equal(ndef.tnfToString(ndef.constants.TNF_UNKNOWN), "Unknown")
//         assert.equal(ndef.tnfToString(ndef.constants.TNF_UNCHANGED), "Unchanged")
//         assert.equal(ndef.tnfToString(ndef.constants.TNF_RESERVED), "Reserved")
//
//         assert.equal(ndef.tnfToString(0), "Empty")
//         assert.equal(ndef.tnfToString(1), "Well Known")
//         assert.equal(ndef.tnfToString(2), "Mime Media")
//         assert.equal(ndef.tnfToString(3), "Absolute URI")
//         assert.equal(ndef.tnfToString(4), "External")
//         assert.equal(ndef.tnfToString(5), "Unknown")
//         assert.equal(ndef.tnfToString(6), "Unchanged")
//         assert.equal(ndef.tnfToString(7), "Reserved")
//     })
//
//     it('should handle invalid TNF', function() {
//         assert.equal(ndef.tnfToString(17), 17)
//         assert.equal(ndef.tnfToString("17"), "17")
//         assert.equal(ndef.tnfToString("foo"), "foo")
//     })
//
// })

describe('Record Type', function() {

  it ('can be a String', function() {
    const message = [
      ndef.record(ndef.constants.TNF_EXTERNAL_TYPE, "com.example:foo", [], "bar")
    ]

    const encoded = ndef.encodeMessage(message)

    assert.deepEqual(externalMessage, encoded)
  })

  it ('can be an Array', function() {
    const message = [
      ndef.record(ndef.constants.TNF_EXTERNAL_TYPE, "com.example:foo", [], "bar")
    ]

    const encoded = ndef.encodeMessage(message)

    assert.deepEqual(externalMessage, encoded)
  })

  it ('should allow UTF-8', function() {

    const message = [
      ndef.record(ndef.constants.TNF_ABSOLUTE_URI, "✓", [], "type is utf-8")
    ]

    const encoded = ndef.encodeMessage(message)
    const expectedBytes = [ 211, 3, 13, 226, 156, 147, 116, 121, 112, 101, 32, 105, 115, 32, 117, 116, 102, 45, 56 ]
    assert.deepEqual(expectedBytes, encoded)

    const decoded = ndef.decodeMessage(encoded)
    assert.equal(decoded[0].type, "✓")
  })
})
