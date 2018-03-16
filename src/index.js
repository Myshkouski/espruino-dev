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
// bus.expect( [
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
  ERR,
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
//     consoleBus.expect([Buffer.from('/on')], () => {
//       Blink.once(LED1)
//       USB.write(JSON.stringify(consoleBus._busState))
//       // toggleConsole()
//     })
//
//     // consoleBus.expect([Buffer.from('/off')], () => {
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

// [0, 0, 255, 0, 255, 0]
// [0, 0, 255, 6, 250, 213, 3, 50, 1, 6, 7, 232, 0]

// [0, 0, 255, 0, 255, 0, 2, 42, 1, 6, 7, 232, 0, 0, 0, ]

// [1, 0, 0, 255, 0, 255, 0, 2, 42, 0, 0, 0, 0, 0, 0, 0]
// [1, 0, 0, 255, 6, 250, 213, 3, 50, 1, 6, 7, 232, 0, 0, 0]

function parseTypeATargetData( raw ) {
  return {
    targetNumber: raw[ 0 ],
    baudrate: 0x00,
    SENS_RES: raw.slice( 1, 3 ), // ATQA
    SEL_RES: raw[ 3 ], // SAK
    NFCID1: raw.slice( 4, 4 + raw[ 4 ] )
  }
}

function parseTypeBTargetData( raw ) {
  return {
    targetNumber: raw[ 0 ],
    baudrate: 0x00,
    ATQB: raw.slice( 1, 13 ),
    ATTRIB_RES: raw.slice( 14, 14 + raw[ 13 ] )
  }
}

function parse212or424TargetData( raw ) {
  const parsed = {
    targetNumber: raw[ 0 ],
    code: raw[ 2 ],
    NFCID2t: raw.slice( 3, 11 ),
    pad: raw.slice( 11, 19 )
  }

  if ( raw[ 1 ] == 20 ) {
    parsed.SYST_CODE = raw.slice( 19, 21 )
  }

  return parsed
}

function parseInnovisionJewelTargetData( raw ) {
  return {
    targetNumber: raw[ 0 ],
    baudrate: 0x00,
    SENS_RES: raw.slice( 1, 3 ),
    JEWELID: raw.slice( 3, 7 )
  }
}

function parseDEP( targetRaw, targetData ) {
  let offset = 0
  if ( targetData.type == 0x00 ) {
    offset = 5 + targetRaw[ 4 ]
    Object.assign( targetData, parseTypeATargetData( targetRaw.slice( 0, offset ) ) )
  } else if ( targetData.type == 0x03 ) {
    offset = 14 + targetRaw[ 13 ]
    Object.assign( targetData, parseTypeBTargetData( targetRaw.slice( 0, offset ) ) )
  } else if ( targetData.type == 0x01 || targetData.type == 0x02 ) {
    offset = 1 + targetRaw[ 1 ]
    Object.assign( targetData, parse212or424TargetData( targetRaw.slice( 0, offset ) ), {
      baudrate: targetData.type
    } )
  } else if ( targetData.type == 0x04 ) {
    offset = 7
    Object.assign( targetData, parseInnovisionJewelTargetData( targetRaw.slice( 0, offset ) ) )
  } else {
    throw new TypeError( 'Unknown type', targetType.type )
  }
  return offset
}

function setup() {
  if ( this.type == 'serial' ) {
    this.transport.setup( 115200 )

    this.transport.on( 'data', data => {
      console.log( Buffer.from( data ) )
      this.push( data )
    } )

    this.transport.write( PN532_COMMAND_WAKEUP )

    console.log( 'configuring sam' )
    this.send( command( [ PN532_COMMAND_SAMCONFIGURATION, 0x01, 20, 0 ] ) )
    this.expect( ACK, () => {
      console.log( 'sam ACK' )
    } )
    this.expect( INFO, () => {
      console.log( 'sam configured' )

      Blink.once( LED1, 20, () => {
        setTimeout( () => Blink.once( LED1, 20 ), 200 )
      } )
    } )
  } else if ( this.type == 'i2c' ) {
    this.transport.setup( {
      bitrate: 400 * 1000
    } )

    this.on( 'drain', () => {
      this._read()
    } )

    try {
      this.send( 1 )
    } catch ( err ) {
      console.log( 'Handled', err.msg )
      console.log( 'Continue...' )
    }

    this.send( command( [ PN532_COMMAND_GETFIRMWAREVERSION ] ) )

    this.expect( [
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

const key = new Uint8Array( Array( 6 )
  .fill( 0xff ) )

const NFCID3 = [ 0x01, 0xFE, 0x0F, 0xBB, 0xBA, 0xA6, 0xC9, 0x89, 0x00, 0x00 ]

const toHexString = arr => [].slice.call( arr )
  .reduce( ( arr, v ) => {
    const str = v.toString( 16 )
      .toUpperCase()
    arr.push( '0x' + ( str.length > 1 ? '' : '0' ) + str )
    return arr
  }, [] )
  .join( ', ' )

setTimeout( () => {
  Promise.resolve()
    .then( () => {
      ( function poll() {
        const sector = 1
        console.log( process.memory()
          .free )
        console.log( bus._busState.watching.length )
        Promise.resolve()
          .then( () => bus.findTargets( 2, 'A' ) )
          .then( data => {
            console.log( 'found target', data )
            LED1.write( 1 )
            return data
          } )
          .then( data => {
            return bus.authenticate( sector * 4, data.uid, key )
          } )
          .then( data => {
            console.log( 'auth', data )
          } )
          // .then( data => bus.writeBlock( 4, [ 1, 3, 6, 4 ] ) )
          // .then( data => {
          //   console.log( 'write op:', data )
          // } )
          .then( data => {
            console.log( 'reading', sector, 'sector' );
            return data
          } )
          .then( data => bus.readSector( sector ) )
          .then( data => {
            console.log( 'after init', data )
            return data
          } )
          // .then( () => new Promise( ( done, fail ) => {
          //   console.log( 'COMMAND InAutoPoll' )
          //   bus.expect( ACK, () => {
          //     console.log( 'ACK InAutoPoll' )
          //     bus.expect( INFO, frame => {
          //       let index = 7
          //       // console.log( 'RESPONSE ( raw ) InAutoPoll', frame )
          //       const data = {
          //         count: frame[ index ],
          //         targets: []
          //       }
          //       for ( let i = 0; i < data.count; i++ ) {
          //         const type = frame[ ++index ]
          //         const length = frame[ ++index ]
          //
          //         const targetRaw = frame.slice( ++index, index += length )
          //
          //         // console.log( 'targetRaw', targetRaw )
          //
          //         const targetData = {
          //           type: type & 7,
          //           br106A: ( type & 7 ) == 0,
          //           br106B: ( type & 7 ) == 3,
          //           br212: ( type & 7 ) == 1,
          //           br424: ( type & 7 ) == 2,
          //
          //           mifareOrFelica: !!( type & 16 ),
          //           isoCompilant: !!( type & 32 ),
          //           dep: !!( type & 64 ),
          //           active: !!( type & 128 )
          //         }
          //
          //         if ( targetData.dep ) {
          //           let offset = 0
          //
          //           if ( !targetData.active ) {
          //             offset = parseDEP( targetRaw, targetData )
          //           }
          //
          //           Object.assign( targetData, {
          //             NFCID3t: targetRaw.slice( offset, offset + 10 ),
          //             DIDt: frame[ offset + 10 ],
          //             BSt: frame[ offset + 11 ],
          //             BRt: frame[ offset + 12 ],
          //             TO: frame[ offset + 13 ],
          //             PPt: frame[ offset + 14 ],
          //             Gt: targetRaw.slice( offset + 15, targetRaw.length )
          //           } )
          //         } else {
          //           parseDEP( targetRaw, targetData )
          //         }
          //
          //         data.targets.push( targetData )
          //       }
          //
          //       console.log( 'RESPONSE InAutoPoll', data )
          //
          //       done( data )
          //     } )
          //   } )
          //
          //   bus.send( command( [
          //     0x60,
          //     0xff, // poll n
          //     0x01, // period = n * 150 ms
          //     0x42, 0x82
          //   ] ) )
          // } ) )
          // .then( found => new Promise( ( done, fail ) => {
          //   bus.expect( ACK, () => {
          //     console.log( 'initAsTarget ACK' )
          //     bus.expect( INFO, frame => {
          //       bus.send( ...ACK )
          //       bus.unwatch()
          //
          //       const data = {
          //         mode: {
          //           baudrate: ( frame[ 8 ] & 112 ) >> 4,
          //           picc: !!( frame[ 8 ] & 15 ),
          //           dep: !!( frame[ 8 ] & 4 ),
          //           framingType: frame[ 8 ] & 3
          //         },
          //         initiatorCommand: frame.slice( 9, -2 )
          //       }
          //
          //       console.log( 'initAsTarget RESPONSE', data )
          //       console.log( 'initAsTarget COMMAND', toHexString( data.initiatorCommand ) )
          //
          //       done( data )
          //     } )
          //   } )
          //
          //   bus.expect( ERR, fail )
          //   bus.expect( NACK, fail )
          //
          //   const c = command( [
          //     0x8c,
          //     1,
          //
          //     0x00, 0x00, //SENS_RES
          //     ...NFCID3.slice( 0, 3 ), //NFCID1
          //     0x40, //SEL_RES
          //
          //     0x01, 0xFE, 0x0F, 0xBB, 0xBA, 0xA6, 0xC9, 0x89, // POL_RES
          //     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          //     0xFF, 0xFF,
          //
          //     ...NFCID3,
          //
          //     13, // length gt
          //
          //     0x46, 0x66, 0x6d,
          //     0x01, 0x01, 0x11,
          //     0x03, 0x02, 0x00, 0x13,
          //     0x04, 0x01, 0x96,
          //
          //     0 // Tk length
          //   ] )
          //
          //   // console.log( c )
          //
          //   bus.send( c )
          // } ) )
          // .then( data => new Promise( ( done, fail ) => {
          //   bus.expect( ACK, () => {
          //     console.log( 'TgResponseToInitiator ACK' )
          //     bus.expect( INFO, frame => {
          //
          //       console.log( 'TgResponseToInitiator RESPONSE', frame )
          //
          //       bus.send( ...ACK )
          //       bus.unwatch()
          //
          //       done()
          //     } )
          //   } )
          //
          //   bus.expect( ERR, fail )
          //   bus.expect( NACK, fail )
          //
          //   bus.send( command( [
          //     0x90,
          //     0x1f,
          //     0xd5, 0x01,
          //     ...NFCID3,
          //     0,
          //     0,
          //     0,
          //     0x0e,
          //     0x32,
          //
          //     0x46, 0x66, 0x6D,
          //     0x01, 0x01, 0x12,
          //     0x03, 0x02, 0x00, 0x13,
          //     0x04, 0x01, 0x64
          //   ] ) )
          // } ) )
          // .then( data => new Promise( ( done, fail ) => {
          //   bus.expect( ACK, () => {
          //     console.log( 'TgGetInitiatorCommand ACK' )
          //     bus.expect( INFO, frame => {
          //
          //       console.log( 'TgGetInitiatorCommand RESPONSE', toHexString( frame ) )
          //
          //       bus.send( ...ACK )
          //       bus.unwatch()
          //
          //       done()
          //     } )
          //   } )
          //
          //   bus.expect( ERR, fail )
          //   bus.expect( NACK, fail )
          //
          //   bus.send( command( [
          //     0x88
          //   ] ) )
          // } ) )
          // .then( data => new Promise( ( done, fail ) => {
          //   bus.expect( ACK, () => {
          //     console.log( 'TgResponseToInitiator ACK' )
          //     bus.expect( INFO, frame => {
          //
          //       console.log( 'TgResponseToInitiator RESPONSE', toHexString( frame ) )
          //
          //       bus.send( ...ACK )
          //       bus.unwatch()
          //
          //       done()
          //     } )
          //   } )
          //
          //   bus.expect( ERR, fail )
          //   bus.expect( NACK, fail )
          //
          //   bus.send( command( [
          //     0x90,
          //     0x06,
          //     0xd4, 0x06,
          //     0x00,
          //     0x00, 0x00
          //   ] ) )
          // } ) )
          // .then( () => new Promise( ( done, fail ) => {
          //   const nack = setTimeout( () => {
          //     bus.send( ...ACK )
          //     bus.unwatch()
          //
          //     fail( 'no answer for tgGetTargetStatus!' )
          //   }, 1000 )
          //
          //   bus.expect( ACK, () => {
          //     console.log( 'tgGetTargetStatus ACK' )
          //     bus.expect( INFO, frame => {
          //       clearTimeout( nack )
          //       bus.unwatch()
          //       console.log( 'tgGetTargetStatus RESPONSE:' )
          //       console.log( toHexString( frame ) )
          //       done()
          //     } )
          //   } )
          //
          //   bus.send( command( [ 0x8a ] ) )
          // } ) )
          // .then( found => {
          //   return found.targets[ 0 ]
          // } )
          // .then( target => new Promise( ( done, fail ) => {
          //   console.log( 'requesting DEP exchange...' )
          //   bus.expect( ACK, () => {
          //     console.log( 'injumpfordep ACK' )
          //     bus.expect( INFO, frame => {
          //       const data = {
          //         code: frame[ 6 ],
          //         status: frame[ 7 ],
          //         targetNumber: frame[ 8 ],
          //         NFCID3t: frame.slice( 9, 19 ),
          //         DIDt: frame[ 19 ],
          //         BSt: frame[ 20 ],
          //         BRt: frame[ 21 ],
          //         TO: frame[ 22 ],
          //         PPt: frame[ 23 ],
          //         Gt: frame.slice( 24, -2 )
          //       }
          //
          //       console.log( 'injumpfordep RESPONSE', data )
          //       console.log( 'general bytes:', toHexString( data.Gt ) )
          //
          //       bus.send( ...ACK )
          //       bus.unwatch()
          //
          //       done( data )
          //     } )
          //   } )
          //
          //   bus.expect( ERR, fail )
          //   bus.expect( NACK, fail )
          //
          //   let payload = [
          //     0x56,
          //     target.active ? 0x00 : 0x01, // active
          //     target.baudrate
          //   ]
          //
          //   if ( !target.active ) {
          //     payload = [
          //       ...payload,
          //       6,
          //
          //       ...NFCID3,
          //
          //       // 0x25, // len,
          //       // 0xd4, 0x00, // atr req
          //       // 0x00,
          //       // 0x00,
          //       // 0x00,
          //       // 0x32,
          //
          //       0x46, 0x66, 0x6D,
          //       0x01, 0x01, 0x12,
          //       0x02, 0x02, 0x07, 0x80, // TLV: MIUX = 128 + MIU 1920
          //       0x03, 0x02, 0x00, 0x03, // TLV: Services
          //       0x04, 0x01, 0x64,
          //       0x07, 0x01, 0x03
          //     ]
          //   } else {
          //     payload = [
          //       ...payload,
          //       1,
          //
          //       0x01, 0x02, 0x03, 0x04, 0x05
          //     ]
          //   }
          //
          //   console.log( payload )
          //
          //   bus.send( command( payload ) )
          // } ) )
          // .then( target => new Promise( ( done, fail ) => {
          //   bus.expect( ACK, () => {
          //     console.log( 'indataexchange ACK' )
          //     bus.expect( INFO, frame => {
          //
          //       console.log( 'indataexchange RESPONSE', frame )
          //
          //       bus.send( ...ACK )
          //       bus.unwatch()
          //
          //       done( target )
          //
          //       // if ( frame[ 7 ] == frame[ 8 ] == frame[ 9 ] == 0x00 ) {
          //       //   console.log( 'SYMM received' )
          //       //   done( target )
          //       // } else {
          //       //   console.log( 'SYMM does not received' )
          //       //   fail()
          //       // }
          //     } )
          //   } )
          //
          //   bus.expect( ERR, fail )
          //   bus.expect( NACK, fail )
          //
          //   bus.send( command( [
          //     0x40,
          //     // target.targetNumber,
          //     0x06, // len
          //     0xd4, 0x06, // dep_req
          //     0x00, // PFB
          //     0x00, 0x00 // SYMM PDU
          //   ] ) )
          // } ) )
          // .then( target => new Promise( ( done, fail ) => {
          //   bus.expect( ACK, () => {
          //     console.log( 'indataexchange ACK' )
          //     bus.expect( INFO, frame => {
          //
          //       console.log( 'indataexchange RESPONSE', frame )
          //
          //       bus.send( ...ACK )
          //
          //       if ( frame[ 7 ] == frame[ 8 ] == frame[ 9 ] == 0x00 ) {
          //         console.log( 'SYMM_RES received' )
          //         done( target )
          //       } else {
          //         console.log( 'SYMM_RES does not received' )
          //         fail()
          //       }
          //     } )
          //   } )
          //
          //   bus.expect( ERR, fail )
          //   bus.expect( NACK, fail )
          //
          //   bus.send( command( [
          //     0x40,
          //     target.targetNumber,
          //     0x06, // len
          //     0xd4, 0x06, // dep_req
          //     0x01, // PFB
          //     0x00, 0x00 // SYMM PDU
          //   ] ) )
          // } ) )
          // .then( target => new Promise( ( done, fail ) => {
          //   bus.expect( ACK, () => {
          //     console.log( 'indataexchange ACK' )
          //     bus.expect( INFO, frame => {
          //
          //       console.log( 'indataexchange RESPONSE', frame )
          //       console.log( 'CONNECT PDU' )
          //
          //       bus.send( ...ACK )
          //
          //       done( target )
          //     } )
          //   } )
          //
          //   bus.expect( ERR, fail )
          //   bus.expect( NACK, fail )
          //
          //   bus.send( command( [
          //     0x40,
          //     target.targetNumber,
          //     0x1e, // len
          //     0x04, 0x06, // DEP_RES
          //     0x01, // info_pdu, pni 0
          //     0x05, 0x20, // CONNECT PDU
          //     0x06, // service name
          //     0x0f, // len
          //     ...[].slice.call( Buffer.from( 'urn:nfc:sn:snep' ) ),
          //     0x02, 0x02, 0x07, 0x80, // TLV MIUX
          //     0x05, 0x01, 0x04 // TLV RWS
          //   ] ) )
          // } ) )
          // // .then( found => new Promise( ( done, fail ) => {
          //   bus.expect( ACK, () => {
          //     console.log( 'tgGetData ack' )
          //     bus.expect( INFO, frame => {
          //
          //       console.log( 'tgGetData response', frame )
          //
          //       bus.send( ...ACK )
          //
          //       done()
          //     } )
          //   } )
          //
          //   bus.expect( ERR, fail )
          //   bus.expect( NACK, fail )
          //
          //   bus.send( command( [
          //     0x86
          //   ] ) )
          // } ) )
          // .then( data => bus.authenticate( 4, data.uid, key ) )
          // .then( data => {
          //   console.log( 'auth', data )
          // } )
          // .then( found => new Promise( ( done, fail ) => {
          //   bus.expect( ACK, () => {
          //     console.log( 'indataexchange ack' )
          //     bus.expect( INFO, frame => {
          //       console.log( 'indataexchange response', frame )
          //       done()
          //     } )
          //   } )
          //
          //   bus.expect( ERR, fail )
          //   bus.expect( NACK, fail )
          //
          //   bus.send( command( [
          //     0x40,
          //     1
          //   ] ) )
          // } ) )
          // .then(data => { console.log('sector 2:', data); return data })
          // .then( data => data.reduce( ( buffer, data ) => [ ...buffer, ...[].slice.call( data.chunk, 0 ) ], [] ) )
          // .then( console.log )
          // .then(data => { console.timeEnd('reading 2 sector'); return data })
          // .then(data => bus.readBlock(4)).then(data => { console.log('block 4:', data) })
          // .then(data => bus.readBlock(5)).then(data => { console.log('block 5:', data) })
          // .then(data => bus.readBlock(6)).then(data => { console.log('block 6:', data) })
          // .then(data => bus.readBlock(7)).then(data => { console.log('block 7:', data) })
          .catch( err => {
            console.error( 'Error:', err )
          } )
          .then( () => {
            LED1.write( 0 )
            LED2.write( 0 )

            bus.send( ...ACK )
            bus.unwatch()

            setTimeout( () => {
              poll()
            }, 500 )
          } )
      } )()
    } )
    .catch( console.error )
}, 1000 )
