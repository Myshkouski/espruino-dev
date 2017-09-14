import Bus from 'bus'
import EventEmitter from 'events'
import { CONSTANTS, cmd } from '../lib/nfc'



const wakeup = new Uint8Array([0x55, 0x55, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
const c = cmd([CONSTANTS.PN532_COMMAND_GETGENERALSTATUS])
const sam = cmd([CONSTANTS.PN532_COMMAND_SAMCONFIGURATION, CONSTANTS.PN532_SAM_NORMAL_MODE,20, 0])

//blink()

function setup(slots, serial) {
  console.log('setup()')

  slots.serial = serial

  serial.setup(115200, {
    rx: B7, tx: B6
  })

  serial.pipe(this)

  serial.write(wakeup)
  serial.write(sam)

  return new Promise(resolve => {
    setTimeout(() => {
      blink.once(LED1, 20, () => setTimeout(() => blink.once(LED1, 20), 200))

      console.log('configured')

      resolve()
    }, 2000)
  })
}

const bus = new Bus({ setup })

bus.on('frame', frame => console.log(process.memory().free, frame))

bus.on('error', err => console.log(err))

bus.setup(Serial1)

bus.deferred(({ serial }) => setInterval(() => serial.write(c), 2000))

bus.deferred(slots => {
  slots.incoming.on('data', data => {
    blink.once(LED2)
    //console.log('incoming', data.chunk)
  })
})
