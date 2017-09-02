import Readable from './readable'
import Writable from './writable'

function _Duplex(options = {}) {

}

const Duplex = extend(_Duplex, Readable, Writable)

export default Duplex
