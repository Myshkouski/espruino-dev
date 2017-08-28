import { SUPER_CHAIN_PROTO_PROP as superChainProp } from './vars'

export default function extend( ...args ) {
  const Child = args[0]
  function Extended() {
    for( let Super of Extended.super_ )
      Super.apply(this, arguments)
  }
  
  Extended[superChainProp] = args
  Extended.prototype = {}

  for(let Super of args) {
    function Proto() {}
    Proto.prototype = Super.prototype

    const p = new Proto()
    
    //Object.assign(Extended.prototype, new Proto())
    for(let prop in p) {
      Extended.prototype[prop] = p[prop]
    }
  }

  Object.defineProperty(Extended.prototype, 'constructor', { value: Child })

  return Extended
}
