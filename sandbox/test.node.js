import {
  Bus
} from 'nfc'
// import Bus from 'bus'

const transport = {
  buffer: Buffer.from( [] ),
  read( length ) {
    const chunk = this.buffer.slice( 0, length )
    this.buffer = Buffer.from( this.buffer, length )
    return chunk
  },

  write( chunk ) {
    this.buffer = Buffer.concat( [ this.buffer, Buffer.from( chunk ) ] )
  }
}

const preamble = [ 1, 2, 3 ]
const postamble = new Uint8Array( [ 4, 5, 6 ] )

const bus = new Bus( {
  transport,
  read( length ) {
    const chunk = this.transport.read( length )

    this.push( chunk )
  },
  write( chunk ) {
    this.transport.write( chunk )
  },
  setup() {
    this.on( 'error', console.error )
    this.on( 'drain', console.log.bind( this, 'drain' ) )
  }
} )

bus.setup()

bus.expect( [
  6
  // preamble,
  // // 2,
  // postamble
], data => {
  console.warn( 'incoming', data )
} )

bus.push( preamble )
// bus.push([1, 2])
bus.push( postamble )
// bus.push('unexpected')
