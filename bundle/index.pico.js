'use strict';

if (typeof console.time !== 'function') {
  var timers = {};

  console.time = function (label) {
    timers[label] = Date.now();
  };

  console.timeEnd = function (label) {
    if (label in timers) {
      console.log(label + ': ' + (Date.now() - timers[label]).toFixed(3) + 'ms');
      delete timers[label];
    }
  };
}

if (typeof console.error !== 'function') {
  console.error = console.log;
}

E.on('init', function () {
  Serial1.setup(115200);
  Serial2.setup(115200);
  Serial1.setConsole(true);
});

setInterval(function () {
  console.log('ok');
}, 1000);

save();

// // import Bus from 'bus'
// // import Schedule from 'schedule'
// import * as Blink from 'blink'
// import {
//   command,
//   ACK,
//   NACK,
//   INFO,
//   XINFO
// } from 'nfc'
// import Bus from 'nfc/bus'
// import {
//   PN532_COMMAND_SAMCONFIGURATION,
//   PN532_SAM_NORMAL_MODE,
//   PN532_COMMAND_WRITEGPIO,
//   PN532_COMMAND_INLISTPASSIVETARGET,
//   PN532_COMMAND_INDATAEXCHANGE,
//   PN532_COMMAND_GETFIRMWAREVERSION,
//   PN532_COMMAND_WAKEUP,
//   MIFARE_COMMAND_READ_16,
//   MIFARE_COMMAND_AUTH_A,
//   MIFARE_COMMAND_AUTH_B,
//   MIFARE_COMMAND_WRITE_4,
//   MIFARE_COMMAND_WRITE_16
// } from 'nfc/constants'
//
// import {
//   encodeMessage,
//   decodeMessage,
//   textRecord
// } from 'esp-ndef'
//
// let usbConsole = true
// let consoleBus = null
// let log = ''
//
// const USB = Serial1
// const LED1 = D5
//
// // function toggleConsole() {
// //   usbConsole = !usbConsole
// //   if (usbConsole) {
// //     consoleBus = null
// //     USB.removeAllListeners()
// //   } else {
// //     consoleBus = new Bus({
// //       setup() {
// //         USB.on('data', data => {
// //           this.parse.call(this, data)
// //           USB.setup()
// //           // USB.write(Buffer.from(['!', ...[].slice.call(data, 0)]))
// //         })
// //       },
// //       read() {},
// //       write() {}
// //     })
// //
// //     consoleBus.rx([Buffer.from('/on')], () => {
// //       Blink.once(LED1)
// //       USB.write(JSON.stringify(consoleBus._busState))
// //       // toggleConsole()
// //     })
// //
// //     // consoleBus.rx([Buffer.from('/off')], () => {
// //     //   LED1.write(1)
// //     //   // USB.write('/off\r\n')
// //     //   // toggleConsole()
// //     // })
// //     //
// //     // consoleBus.on('error', err => {
// //     //   Blink.once(LED1, 200)
// //     // })
// //
// //     consoleBus.setup()
// //   }
// //
// //   usbConsole ?
// //     USB.setConsole(false) :
// //     LoopbackA.setConsole(false)
// // }
// //
// // toggleConsole()
//
// // setWatch( toggleConsole, BTN1, {
// //   repeat: true,
// //   edge: 'rising',
// //   debounce: 50
// // } )
// //
// // Blink.start( LED2 )
// //
// // const encoded = encodeMessage( [
// //   textRecord( '2enhello world!' )
// // ] )
// //
// const wakeup = command( [ PN532_COMMAND_WAKEUP ] )
// const sam = command( [ PN532_COMMAND_SAMCONFIGURATION, PN532_SAM_NORMAL_MODE, 20, 0 ] )
//
// const serial = Serial2
// USB.setConsole(true)
//
//
// function setup( done ) {
//   serial.setup( 115200 )
//
//   serial.write( wakeup )
//   serial.write( sam )
//
//   setTimeout( () => {
//     serial.read()
//     serial.on( 'data', data => bus.parse( data ) )
//     Blink.once( LED1, 20, () => setTimeout( () => Blink.once( LED1, 20 ), 200 ) )
//   }, 50 )
// }
//
// const bus = new Bus( {
//   setup,
//   read() {},
//   write( chunk ) {
//     serial.write( chunk )
//   },
//   highWaterMark: 64
// } )
//
// bus.on( 'error', err => {
//   console.error( 'BusError:', err )
// } )
//
// bus.setup()
//
// const key = new Uint8Array( [].fill( 0xff, 0, 6 ) )
//
// setTimeout( () => {
//   ( function poll() {
//     // console.log(process.memory().free)
//     // console.log(bus._busState.watching.length)
//     Promise.resolve()
//       .then( () => bus.findTargets( 1, 'A' ) ) // .then(data => { console.log('found card', data.uid); return data })
//       .then( data => {
//         LED1.write( true )
//         return data
//       } )
//       // .then(data => bus.authenticate(4, data.uid, key).then(data => { console.log('auth op 4:', data) }).then(() => bus.authenticate(3, data.uid, key).then(data => { console.log('auth op:', data) })))
//       .then( data => bus.authenticate( 1 * 4, data.uid, key ) ) // .then(data => { console.log('auth', data) })
//       // .then(data => bus.writeBlock(4, [1, 3, 6, 4])).then(data => { console.log('write op:', data) })
//       // .then(data => { console.time('reading 2 sector'); return data })
//       .then( data => bus.readSector( 1 ) )
//       .then( data => {
//         LED1.write( false )
//         return data
//       } ) // .then(data => { console.log('sector 2:', data); return data })
//       .then( data => data.reduce( ( buffer, data ) => [ ...buffer, ...[].slice.call( data.chunk, 0 ) ], [] ) )
//       .then( console.log )
//       // .then(data => { console.timeEnd('reading 2 sector'); return data })
//       // .then(data => bus.readBlock(4)).then(data => { console.log('block 4:', data) })
//       // .then(data => bus.readBlock(5)).then(data => { console.log('block 5:', data) })
//       // .then(data => bus.readBlock(6)).then(data => { console.log('block 6:', data) })
//       // .then(data => bus.readBlock(7)).then(data => { console.log('block 7:', data) })
//       .catch( err => {
//         LED1.write( false )
//         console.error( 'Error:', err )
//       } )
//       .then( () => {
//         setTimeout( () => {
//           poll()
//         }, 500 )
//       } )
//   } )()
// }, 1000 )
