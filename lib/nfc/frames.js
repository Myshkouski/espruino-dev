import {
  PN532_PREAMBLE,
  PN532_STARTCODE1,
  PN532_STARTCODE2,
  PN532_HOST_TO_PN532,
  PN532_PN532_TO_HOST,
  PN532_POSTAMBLE
} from './constants'

const check = values => !( 0xff & ( -values.reduce( ( sum, value ) => sum + value, 0 ) ) )

const LCS = ( byte, length, frame ) => check( frame.slice( -2 ) )

const EXTENDED_LCS = ( byte, length, frame ) => check( [ frame[ 5 ] * 256 + frame[ 6 ], frame[ 7 ] ] )

const CHECKSUM = ( byte, length, frame ) => check( frame.slice( 5 ) )

const EXTENDED_CHECKSUM = ( byte, length, frame ) => check( frame.slice( 8 ) )

const BODY = frame => frame[ 3 ] - 1 /* response code + payload */

const EXTENDED_BODY = frame => 256 * frame[ 5 ] + frame[ 6 ]

export const INFO = [
  [ PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, undefined, LCS, PN532_PN532_TO_HOST ],
  BODY, [ CHECKSUM, PN532_POSTAMBLE ]
]

export const XINFO = [
  [ PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0xff, 0xff ], 2, [ EXTENDED_LCS, PN532_PN532_TO_HOST ],
  EXTENDED_BODY, [ EXTENDED_CHECKSUM, PN532_POSTAMBLE ]
]

export const ERR = [
  [ PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x01, 0xff, undefined, CHECKSUM, PN532_POSTAMBLE ]
]

export const ACK = [
  new Uint8Array( [ PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x00, 0xff, PN532_POSTAMBLE ] )
]

export const NACK = [
  new Uint8Array( [ PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0xff, 0x00, PN532_POSTAMBLE ] )
]

export const command = command =>
  new Uint8Array( [
    PN532_PREAMBLE,
    PN532_STARTCODE1,
    PN532_STARTCODE2,
    0xff & ( command.length + 1 ),
    0xff & ( ~command.length ),
    PN532_HOST_TO_PN532,
    ...command,
    // checksum
    0xff & ( -command.reduce( ( checksum, byte ) => checksum + byte, PN532_HOST_TO_PN532 ) ),
    PN532_POSTAMBLE
  ] )
