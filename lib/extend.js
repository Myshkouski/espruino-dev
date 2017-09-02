import { SUPER_CHAIN_PROTO_PROP } from './vars'

export default function extend(...args) {
  const Child = args[0]

  function Extended() {
    if(Extended.prototype[SUPER_CHAIN_PROTO_PROP])
      Extended.prototype[SUPER_CHAIN_PROTO_PROP].forEach(Super => Super.apply(this, arguments))
  }

  //defProp(ProtoOfExtended, 'name', { value: Child.name })

  Extended.prototype = {}

  args.forEach(Super => {
    function Proto() {}
    Proto.prototype = Super.prototype

    const proto = new Proto()

    //Object.assign(Extended.prototype, new Proto())
    for(let prop in proto)
      Extended.prototype[prop] = proto[prop]
  })

  Extended.prototype[SUPER_CHAIN_PROTO_PROP] = args
  //defProp(Extended.prototype, SUPER_CHAIN_PROTO_PROP, { value: args })
  Extended.prototype.constructor = Child
  //defProp(Extended.prototype, 'constructor', { value:  Child })
  Extended.name = Child.name
  //defProp(Extended, 'name', { value: Child.name })

  return Extended
}
