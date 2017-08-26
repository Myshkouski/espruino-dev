import Readable from './readable'
import Writable from './writable'

const Duplex = extend(Readable, extend(Writable, function Duplex() {
  
}, true), true)

export default Duplex
