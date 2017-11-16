//import Bus from 'bus'
//import { CONSTANTS, cmd } from '../lib/nfc'

import series from 'helpers/series'

import * as ndef from 'ndef'

const encoded = ndef.encodeMessage([
  ndef.textRecord('2enhello world!')
])

const decodeIterator = (chunk, next, decoder, index, decoders) => {
  decoder(chunk, res => {
    if(++index < decoders.length) {
      next(res)
    } else {
      next(new Error({
        type: 'DecoderError',
        msg: 'Cannot decode chunk',
        chunk
      }))
    }
  })
}

function _Decoder() {
  this._decoderState = {
    receive: []
  }
}

_Decoder.prototype = {
  rx(decoder, cb) {
    this.receive.push({
      decoder, cb
    })
  },/*

  tx(encoder, cb) {
    this.transmit.push({
      encoder, cb
    })
  },*/

  decode(chunk) {
    return new Promise((done, fail) => {
      series(this._decoderState.receive, (next, decoder, index, decoders) => { decodeIterator(chunk, next, decoder, index, decoders) }, err => {
        this._decoderState.receive.splice(0)

        if(err) {
          fail(err)
        } else {
          done()
        }
      })
    })
  }
}

const Decoder = _extend({
  super: [Schedule],
  apply: [_Decoder, Schedule]
})


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
