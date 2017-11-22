import Bus from 'bus'
import Schedule from 'schedule'
import blink from 'blink'
import { command, ACK, NACK, INFO, XINFO } from 'nfc'
import {
  PN532_COMMAND_SAMCONFIGURATION,
  PN532_SAM_NORMAL_MODE,
  PN532_COMMAND_WRITEGPIO,
  PN532_COMMAND_INLISTPASSIVETARGET,
  PN532_COMMAND_INDATAEXCHANGE,
  PN532_COMMAND_GETFIRMWAREVERSION,
  PN532_WAKEUP,
  MIFARE_CMD_READ_16,
  MIFARE_CMD_AUTH_A,
  MIFARE_CMD_AUTH_B,
  MIFARE_CMD_WRITE_4,
  MIFARE_CMD_WRITE_16
} from 'nfc/constants'

import series from 'series'

import { encodeMessage, decodeMessage, textRecord } from 'esp-ndef'

blink()

const encoded = encodeMessage([
  textRecord('2enhello world!')
])

const wakeup = command([PN532_WAKEUP])
const sam = command([PN532_COMMAND_SAMCONFIGURATION, PN532_SAM_NORMAL_MODE, 20, 0])

function rx(data) {
  this._busState.push(data)
  this._busState.nodes().forEach(node => this.parse(node.chunk))
}

function setup(done) {
  Serial1.setup(115200, {
    rx: B7, tx: B6
  })

  Serial1.write(wakeup)
  Serial1.write(sam)

  setTimeout(() => {
    Serial1.read()
    Serial1.on('data', rx.bind(this))
  }, 1500)

  setTimeout(() => {
    blink.once(LED1, 20, () => setTimeout(() => blink.once(LED1, 20), 200))

    done()
  }, 2000)
}

const bus = new Bus({
  setup, highWaterMark: 64
})

const schedule = new Schedule()

bus.on('error', console.error)

schedule.deferred(setup.bind(bus))

const readBlock = (uid, key, block) => {
  const auth = (done, fail) => {
    "compiled"

    const AUTH = command([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_AUTH_A,
      block,
      ...key,
      ...uid
    ])

    bus.rx(ack, ack => {})

    bus.rx(err, err => {
      console.error(err)
      fail(err)
    })

    bus.rx(info, frame => {
      console.log('AUTH SUCCEED', {
        code: frame[6],
        body: frame.slice(7, -2)
      })

      done()
    })

    Serial1.write(AUTH)
  }

  const read = (done, fail) => {
    console.log('read')
    const READ = command([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_READ_16,
      block
    ])

    bus.rx(ack, ack => {})

    bus.rx(err, err => {
      console.error(err)
      fail(err)
    })

    bus.rx(info, frame => {
      const body = frame.slice(8, -2)
      const data = {
        block,
        status: frame[7],
        body,
        length: body.length
      }

      done(data)
    })

    Serial1.write(READ)
  }

  return Promise.resolve()
    .then(() => new Promise(auth))
    .then(() => new Promise(read))
}

const readSector = (uid, key, sector) => {
  return new Promise((done, fail) => {
    const readBlocksArr = []
    for(let block = sector * 4; block < sector * 4 + 4; block ++) {
      readBlocksArr.push(block)
    }
    series(readBlocksArr, (next, block, index) => {
      readBlock(uid, key, block).then(data => {
        readBlocksArr[index] = data
        next()
      })
    }, () => done(readBlocksArr))
  })
}

const key = new Uint8ClampedArray([0xff, 0xff, 0xff, 0xff, 0xff, 0xff])

;(function poll() {
  let uid,
      block = 0,
      data = null

  schedule.deferred(done => {
    const LIST = command([
      PN532_COMMAND_INLISTPASSIVETARGET,
      1,
      0
    ])

    bus.rx(ACK, () => {
      console.log('ACK')
    })

    bus.rx(INFO, frame => {
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

  schedule.deferred((done, fail) => {
    readSector(uid, key, 0)
      .then(data => {
        console.log(data)
        return data
      })
      .then(done).catch(console.error)
  })

  schedule.deferred(done => {
    setTimeout(() => {
      console.log(process.memory().free)
      done()
      poll()
    }, 1000)
  })
})()
