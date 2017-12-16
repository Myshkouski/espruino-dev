import Bus from 'bus'
import {
  command,
  ACK,
  NACK,
  ERR,
  INFO
} from './'
import {
  PN532_COMMAND_INLISTPASSIVETARGET,
  PN532_COMMAND_INDATAEXCHANGE,
  MIFARE_COMMAND_AUTH_A,
  MIFARE_COMMAND_READ_16,
  MIFARE_COMMAND_WRITE_16,
  PN532_BRTY_ISO14443A,
  PN532_BRTY_ISO14443B
} from './constants'

import series from 'series'

const sliceAck = chunk => chunk.slice( ACK.length )

const parseInfo = chunk => {
  return {
    raw: chunk,
    code: chunk[ 6 ],
    body: Buffer.from( chunk.slice( 7, 5 + chunk[ 3 ] ) )
  }
}

const parseBlockData = data => {
  if ( data.body.length == 1 ) {
    throw {
      cmd: data.code,
      errCode: data.body[ 0 ]
    }
  } else {
    return {
      chunk: data.body.slice( 1 )
    }
  }
}

const NfcBus = {
  makeTransaction( cmd, info, parsers ) {
    return new Promise( ( done, fail ) => {
        // Don't be silly again - info frame refers to index from beginning, i.e. to ACK
        // this.rx([...ACK, ...info], chunk => done((parsers || [sliceAck, parseInfo]).reduce((data, parse) => parse(data), chunk)))
        this.rx( ACK, () => {
          this.rx( info, chunk => done( ( parsers || [ parseInfo ] )
            .reduce( ( data, parse ) => parse( data ), chunk ) ) )
        } )

        this.rx( NACK, fail )
        this.rx( ERR, fail )

        this.tx( command( cmd ) )
      } )
      .catch( err => {
        this.unwatch()
        throw err
      } )
      .then( data => {
        this.unwatch()
        return data
      } )
  },

  findTargets( count, type ) {
    if ( type == 'A' ) {
      type = PN532_BRTY_ISO14443A
    } else if ( type == 'B' ) {
      type = PN532_BRTY_ISO14443B
    } else {
      throw new Error( 'Unknown ISO14443 type:', type )
    }

    return this.makeTransaction( [
      PN532_COMMAND_INLISTPASSIVETARGET,
      count,
      type
    ], INFO, [ chunk => {
      const body = chunk.slice( 7, 5 + chunk[ 3 ] )
      const uid = body.slice( 6, 6 + body[ 5 ] )
      return {
        code: chunk[ 6 ],
        body,
        count: body[ 0 ],
        atqa: body.slice( 2, 4 ), // SENS_RES
        sak: body[ 4 ],
        uid
      }
    } ] )
  },

  authenticate( block, uid, key ) {
    return this.makeTransaction( [
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_COMMAND_AUTH_A,
      block,
      ...[].slice.call( key ),
      ...[].slice.call( uid )
    ], INFO )
  },

  readBlock( block ) {
    return this.makeTransaction( [
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_COMMAND_READ_16,
      block
    ], INFO, [ parseInfo, parseBlockData ] )
  },

  writeBlock( block, chunk ) {
    return this.makeTransaction( [
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_COMMAND_WRITE_16,
      block,
      ...[].slice.call( chunk )
    ], INFO )
  },

  readSector( sector ) {
    return new Promise( ( done, fail ) => {
      const readBlocksArr = []
      for ( let block = sector * 4; block < sector * 4 + 3; block++ ) {
        readBlocksArr.push( block )
      }

      series( readBlocksArr, ( next, block, index ) => {
        this.readBlock( block )
          .then( data => {
            readBlocksArr[ index ] = data
            next()
          } )
          .catch( err => {
            console.log( '!!!' )
            next( err )
          } )
      }, err => err ? fail( err ) : done( readBlocksArr ) )
    } )
  },

  writeSector( start, chunk ) {

  }
}

export default options => Object.assign( new Bus( options ), NfcBus )