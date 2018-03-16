import Bus from 'bus'
import {
  deepEqual
} from 'assert'

const frame1 = new Uint8ClampedArray( [ 0, 1, 2, 3, 4 ] ),
  frame2 = new Uint8ClampedArray( [ 5, 6, 7, 8, 9 ] )

describe( 'Bus', () => {
  describe( '#read()', () => {
    const bus = new Bus( {
      setup() {}
    } )

    it( 'should return all buffered data', () => {
      bus.expect( [
        frame1,
        frame2
      ], frame => {
        deepEqual( frame.length, 10 )
      } )

      bus.push( [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] )
    } )
  } )
} )

describe( 'Patterns', () => {
  let bus, preamble, header, trailer, postamble

  beforeEach( () => {
    bus = new Bus( {
      read() {},
      write() {},
      setup() {}
    } )

    preamble = [ 1, 2, 3 ]
    header = [ 4, ( byte, index, frame ) => byte == 5, 6 ]
    trailer = 3
    postamble = frame => 3
  } )

  it( 'should accept array patterns', () => {
    bus.on( 'error', console.error )

    bus.expect( [
      preamble
    ], console.log )

    bus.push( [ 1, 2, 3 ] )
  } )

  it( 'should accept functions in arrays that resolves to [Boolean]', () => {
    const pattern = [ 1, 2, ( byte, index, frame ) => byte === 3 ]

    bus.expect( [
      pattern
    ] )

    bus.push()
  } )
} )
