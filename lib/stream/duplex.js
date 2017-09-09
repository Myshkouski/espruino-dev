import Readable from './readable'
import Writable from './writable'

function _Duplex(options = {}) {}
_named('Duplex', _Duplex)

const Duplex = _extend({
	name: 'Duplex',
  super: [Readable, Writable],
  apply: [Readable, Writable, _Duplex]
})

Duplex.prototype.on = function on() {
  Readable.prototype.on.apply(this, arguments)
  //Writable.prototype.on.apply(this, arguments)

  return this
}

export default Duplex
