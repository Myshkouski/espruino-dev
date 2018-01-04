// import Bus from 'bus'
//
// const preamble = [ 1, 2, 3 ]
// const postamble = [ 4, ( {
//   getFrame,
//   getAbsoluteIndex,
//   getRelativeIndex
// } ) => {
//   console.log( getAbsoluteIndex( 1 ), getRelativeIndex( 0 ) )
//   return true
// }, 6 ]
//
// const bus = new Bus( {
//   read() {},
//   write() {},
//   setup() {}
// } )
//
// bus.on( 'error', console.error )
//
// bus.rx( [
//   preamble,
//   postamble
// ], console.log )
//
// bus.push( preamble )
// bus.push( postamble )

// import Bus from 'bus'
// import Schedule from 'schedule'
import * as Blink from 'blink'
import {
  command,
  ACK,
  NACK,
  INFO,
  XINFO
} from 'nfc'
import Bus from 'nfc/bus'
import {
  PN532_I2C_ADDRESS,
  PN532_COMMAND_SAMCONFIGURATION,
  PN532_SAM_NORMAL_MODE,
  PN532_COMMAND_WRITEGPIO,
  PN532_COMMAND_INLISTPASSIVETARGET,
  PN532_COMMAND_INDATAEXCHANGE,
  PN532_COMMAND_GETFIRMWAREVERSION,
  PN532_COMMAND_WAKEUP,
  MIFARE_COMMAND_READ_16,
  MIFARE_COMMAND_AUTH_A,
  MIFARE_COMMAND_AUTH_B,
  MIFARE_COMMAND_WRITE_4,
  MIFARE_COMMAND_WRITE_16
} from 'nfc/constants'

import {
  encodeMessage,
  decodeMessage,
  textRecord
} from 'esp-ndef'

// let usbConsole = true
// let consoleBus = null
// let log = ''
//
//
// function toggleConsole() {
//   usbConsole = !usbConsole
//   if (usbConsole) {
//     consoleBus = null
//     USB.removeAllListeners()
//   } else {
//     consoleBus = new Bus({
//       setup() {
//         USB.on('data', data => {
//           this.parse.call(this, data)
//           USB.setup()
//           // USB.write(Buffer.from(['!', ...[].slice.call(data, 0)]))
//         })
//       },
//       read() {},
//       write() {}
//     })
//
//     consoleBus.rx([Buffer.from('/on')], () => {
//       Blink.once(LED1)
//       USB.write(JSON.stringify(consoleBus._busState))
//       // toggleConsole()
//     })
//
//     // consoleBus.rx([Buffer.from('/off')], () => {
//     //   LED1.write(1)
//     //   // USB.write('/off\r\n')
//     //   // toggleConsole()
//     // })
//     //
//     // consoleBus.on('error', err => {
//     //   Blink.once(LED1, 200)
//     // })
//
//     consoleBus.setup()
//   }
//
//   usbConsole ?
//     USB.setConsole(false) :
//     LoopbackA.setConsole(false)
// }
//
// toggleConsole()

// setWatch( toggleConsole, BTN1, {
//   repeat: true,
//   edge: 'rising',
//   debounce: 50
// } )
//
// Blink.start( LED2 )
//
// const encoded = encodeMessage( [
//   textRecord( '2enhello world!' )
// ] )
//
// import fs from 'fs'

const wakeup = command( [ PN532_COMMAND_WAKEUP ] )
const sam = command( [ PN532_COMMAND_SAMCONFIGURATION, PN532_SAM_NORMAL_MODE, 20, 0 ] )

// [0, 0, 255, 0, 255, 0]
// [0, 0, 255, 6, 250, 213, 3, 50, 1, 6, 7, 232, 0]

// [0, 0, 255, 0, 255, 0, 2, 42, 1, 6, 7, 232, 0, 0, 0, ]

// [1, 0, 0, 255, 0, 255, 0, 2, 42, 0, 0, 0, 0, 0, 0, 0]
// [1, 0, 0, 255, 6, 250, 213, 3, 50, 1, 6, 7, 232, 0, 0, 0]

function setup() {
  if ( this.type == 'serial' ) {
    this.transport.setup( 115200 )

    this.transport.write( wakeup )
    this.transport.write( sam )

    setTimeout( () => {
      this.transport.read()
      this.transport.on( 'data', data => this.push( data ) )
      console.log( 'Bus has been set up' )
      Blink.once( LED1, 20, () => {
        setTimeout( () => Blink.once( LED1, 20 ), 200 )
      } )

      this.rx( [
        ...ACK,
        ...INFO
      ], frame => {
        console.log( 'frame' )
        console.log( frame )
      } )

      this.tx( command( [ PN532_COMMAND_GETFIRMWAREVERSION ] ) )
    }, 500 )
  } else if ( this.type == 'i2c' ) {
    this.transport.setup( {
      bitrate: 400 * 1000
    } )

    this.on( 'drain', () => {
      this._read()
    } )

    try {
      this.tx( 1 )
    } catch ( err ) {
      console.log( 'Handled', err.msg )
      console.log( 'Continue...' )
    }

    this.tx( command( [ PN532_COMMAND_GETFIRMWAREVERSION ] ) )

    this.rx( [
      ...ACK,
      ...INFO
    ], {
      timeout: 10
    }, frame => {
      console.log( 'frame' )
      console.log( frame )
    } )
  }
}

const bus = new Bus( {
  transport: Serial1,
  type: 'serial',
  setup,
  read( length ) {
    if ( this.type == 'i2c' ) {
      while ( true ) {
        if ( this.transport.readFrom( PN532_I2C_ADDRESS, 1 )[ 0 ] ) {
          const chunk = this.transport.readFrom( PN532_I2C_ADDRESS, 1 + length )
          this.push( chunk )
        } else {
          break
        }
      }
    } else if ( this.type == 'serial' ) {
      // const chunk = this.transport.read(length)
      // this.push(chunk)
    }
  },
  write( chunk ) {
    if ( this.type == 'serial' ) {
      this.transport.write( chunk )
    } else if ( this.type == 'i2c' ) {
      this.transport.writeTo( PN532_I2C_ADDRESS, chunk )
    }
  },
  highWaterMark: 16
} )

bus.on( 'error', err => {
  console.error( 'BusError:', err )
} )

bus.setup()

// const key = new Uint8  Array(Array(6).fill(0xff))

// console.log(key)


// setTimeout(() => {
//   (function poll() {
//     // console.log(process.memory().free)
//     // console.log(bus._busState.watching.length)
//     Promise.resolve()
//       .then(() => bus.findTargets(1, 'A')) // .then(data => { console.log('found card', data.uid); return data })
//       .then(data => {
//         LED1.write(0)
//         return data
//       })
//       // .then(data => bus.authenticate(4, data.uid, key).then(data => { console.log('auth op 4:', data) }).then(() => bus.authenticate(3, data.uid, key).then(data => { console.log('auth op:', data) })))
//       .then(data => bus.authenticate(1 * 4, data.uid, key)) // .then(data => { console.log('auth', data) })
//       // .then(data => bus.writeBlock(4, [1, 3, 6, 4])).then(data => { console.log('write op:', data) })
//       // .then(data => { console.time('reading 2 sector'); return data })
//       .then(data => bus.readSector(1))
//       .then(data => {
//         LED1.write(1)
//         return data
//       }) // .then(data => { console.log('sector 2:', data); return data })
//       .then(data => data.reduce((buffer, data) => [...buffer, ...[].slice.call(data.chunk, 0)], []))
//       .then(console.log)
//       // .then(data => { console.timeEnd('reading 2 sector'); return data })
//       // .then(data => bus.readBlock(4)).then(data => { console.log('block 4:', data) })
//       // .then(data => bus.readBlock(5)).then(data => { console.log('block 5:', data) })
//       // .then(data => bus.readBlock(6)).then(data => { console.log('block 6:', data) })
//       // .then(data => bus.readBlock(7)).then(data => { console.log('block 7:', data) })
//       .catch(err => {
//         LED1.write(1)
//         console.error('Error:', err)
//       })
//       .then(() => {
//         setTimeout(() => {
//           poll()
//         }, 500)
//       })
//   })()
// }, 1000)
