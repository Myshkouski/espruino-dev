import Readable from './readable'
import Writable from './writable'

function _Duplex(options = {}) {}

const Duplex = _extend({
	name: 'Duplex',
  super: [Readable, Writable],
  apply: [Readable, Writable, _named('Duplex', _Duplex)]
})

Duplex.prototype.on = function on() {
  Readable.prototype.on.apply(this, arguments)
  //Writable.prototype.on.apply(this, arguments)

  return this
}

export default Duplex
