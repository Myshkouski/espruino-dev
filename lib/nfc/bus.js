import Bus from 'bus'
import { command, ACK, NACK, ERR } from './'
import {
  PN532_COMMAND_INDATAEXCHANGE,
  MIFARE_CMD_AUTH_A,
  MIFARE_CMD_READ_16
} from './constants'

const parseInfo = chunk => ({
  code: frame[6],
  body: frame.slice(7, 5 + frame[3])
})

const makeTransaction = (cmd, extended, parsers) =>
  new Promise((done, fail) => {
    this.rx(NACK, fail)
    this.rx(ERR, fail)
    this.rx([...ACK, ...(extended ? XINFO : INFO)], chunk => done((parsers || [parseInfo]).reduce((data, parse) => parse(data), chunk)))

    this.tx(command(cmd))
  })

const NfcBus = {
  authenticate (block, uid, key) {
    return makeTransaction([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_AUTH_A,
      block,
      ...key,
      ...uid
    ])
  },

  readBlock (block) {
    return makeTransaction([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_READ_16,
      block
    ])
  }
}

export default () => Object.assign(Bus(), NfcBus)
