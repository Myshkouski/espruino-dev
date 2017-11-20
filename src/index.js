import Bus from 'bus'
import blink from 'blink'
import { command, ack, nack, info, xinfo, err } from 'nfc'
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

import { encodeMessage, textRecord } from 'esp-ndef'

blink()

const encoded = encodeMessage([
  textRecord('2enhello world!')
])

const wakeup = command([PN532_WAKEUP])
const sam = command([PN532_COMMAND_SAMCONFIGURATION, PN532_SAM_NORMAL_MODE, 20, 0])




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
    const LIST = command([
      PN532_COMMAND_INLISTPASSIVETARGET,
      1,
      0
    ])

    bus.rx(ack, () => {
      console.log('ACK')
    })

    bus.rx(info, frame => {
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
    const AUTH = command([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_AUTH_A,
      block
    ].concat(KEY).concat(uid))

    bus.rx(ack, ack => {})

    bus.rx(err, fail)

    bus.rx(info, frame => {
      console.log('AUTH SUCCEED'/*, {
        code: frame[6],
        body: frame.slice(7, 5 + frame[3])
      }*/)

      done()
    })

    Serial1.write(AUTH)
  })

  bus.deferred((done, fail) => {
    const WRITE = command([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_WRITE_4,
      block
    ].concat(encoded))

    bus.rx(ack, ack => {})

    bus.rx(err, fail)

    bus.rx(info, block => {
      console.log('WRITE SUCCEED')

      done()
    })

    Serial1.write(WRITE)
  })

  bus.deferred((done, fail) => {
    const READ = command([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_READ,
      block
    ])

    bus.rx(ack, ack => {})

    bus.rx(err, fail)

    bus.rx(info, block => {
      console.log("RED", block)

      done()
    })

    Serial1.write(READ)
  })

  bus.deferred(done => {
    setTimeout(() => {
      console.log(process.memory().free)
      done()
      poll()
    }, 1000)
  })
})()
