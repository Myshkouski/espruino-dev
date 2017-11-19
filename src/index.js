import Bus from 'bus'
import blink from 'blink'
import { cmd } from 'nfc'
import {
  PN532_COMMAND_SAMCONFIGURATION,
  PN532_SAM_NORMAL_MODE,
  PN532_COMMAND_WRITEGPIO,
  PN532_COMMAND_INLISTPASSIVETARGET,
  PN532_COMMAND_INDATAEXCHANGE,
  PN532_COMMAND_GETFIRMWAREVERSION,
  PN532_WAKEUP,
  MIFARE_CMD_READ,
  MIFARE_CMD_AUTH_A,
  MIFARE_CMD_AUTH_B,
  MIFARE_CMD_WRITE_4,
  MIFARE_CMD_WRITE_16
} from 'nfc/constants'

import series from 'series'

import { encodeMessage, textRecord } from 'ndef'

blink()

const encoded = encodeMessage([
  textRecord('2enhello world!')
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

const wakeup = cmd([PN532_WAKEUP])
const sam = cmd([PN532_COMMAND_SAMCONFIGURATION, PN532_SAM_NORMAL_MODE, 20, 0])




function setup(done) {
  Serial1.setup(115200, {
    rx: B7, tx: B6
  })

  Serial1.write(wakeup)
  Serial1.write(sam)

  setTimeout(() => {
    Serial1.read()
    Serial1.pipe(this)
  }, 1500)

  setTimeout(() => {
    blink.once(LED1, 20, () => setTimeout(() => blink.once(LED1, 20), 200))

    done()
  }, 2000)
}

const bus = new Bus({
  setup, highWaterMark: 64
})

bus.on('error', console.error)

bus.setup(Serial1)

const KEY = new Uint8ClampedArray([0xff, 0xff, 0xff, 0xff, 0xff, 0xff])

let afi = 0x00


;(function poll() {
  let uid,
      block = 4,
      data = null

  bus.deferred(done => {
    const LIST = cmd([
      PN532_COMMAND_INLISTPASSIVETARGET,
      1,
      0
    ])

    bus.rx(ACK_FRAME, ack => {
      console.log('ACK')
    })

    bus.rx(INFO_FRAME_std, frame => {
      const body = frame.slice(7, 5 + frame[3]),
            uidLength = body[5],
            _uid = body.slice(6, 6 + uidLength)

      console.log('FOUND', {
        code: frame[6],
        body,
        count: body[0],
        ATQA: body.slice(2, 4), // SENS_RES
        SAK: body[4],
        uidLength,
        uid: _uid
      }['ATQA'])

      uid = _uid

      done()
    })

    Serial1.write(LIST)
  })

  bus.deferred((done, fail) => {
    const AUTH = cmd([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_AUTH_A,
      block
    ].concat(KEY).concat(uid))

    bus.rx(ACK_FRAME, ack => {})

    bus.rx(ERR_FRAME, fail)

    bus.rx(INFO_FRAME_std, frame => {
      console.log('AUTH SUCCEED'/*, {
        code: frame[6],
        body: frame.slice(7, 5 + frame[3])
      }*/)

      done()
    })

    Serial1.write(AUTH)
  })

  bus.deferred((done, fail) => {
    const WRITE = cmd([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_WRITE_4,
      block
    ].concat(encoded))

    bus.rx(ACK_FRAME, ack => {})

    bus.rx(ERR_FRAME, fail)

    bus.rx(INFO_FRAME_std, block => {
      console.log('WRITE SUCCEED')

      done()
    })

    Serial1.write(WRITE)
  })

  bus.deferred((done, fail) => {
    console.log('READ')
    const READ = cmd([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_READ,
      block
    ])

    bus.rx(ACK_FRAME, ack => {})

    //bus.rx(ERR_FRAME, fail)

    bus.rx(INFO_FRAME_std, block => {
      console.log("RED", block)

      done()
    })

    Serial1.write(READ)
  })

  bus.deferred(done => {
    setTimeout(() => {
      console.log(process.memory())
      done()
      poll()
    }, 1000)
  })
})()
