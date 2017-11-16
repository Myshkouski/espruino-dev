import Schedule from 'schedule'
import series from 'helpers/series'

const decodeIterator = (chunk, next, decoder, index, decoders) => {
  decoder(chunk, res => {
    if(++index < decoders.length) {
      next(res)
    } else {
      next(new Error({
        type: 'DecodeError',
        msg: 'Cannot decode chunk',
        chunk
      }))
    }
  })
}

function _Decoder() {
  this._decoderState = {
    receive: []
  }
}

_Decoder.prototype = {
  rx(decoder, cb) {
    this.receive.push({
      decoder, cb
    })
  },/*

  tx(encoder, cb) {
    this.transmit.push({
      encoder, cb
    })
  },*/

  decode(chunk) {
    return new Promise((done, fail) => {
      series(this._decoderState.receive, (next, decoder, index, decoders) => { decodeIterator(chunk, next, decoder, index, decoders) }, err => {
        this._decoderState.receive.splice(0)

        if(err) {
          fail(err)
        } else {
          done()
        }
      })
    })
  }
}

const Decoder = _extend({
  super: [Schedule],
  apply: [_Decoder, Schedule]
})

export default Decoder
