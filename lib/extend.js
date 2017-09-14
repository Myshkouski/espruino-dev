import {
  SUPER_CHAIN_PROTO_PROP,
  SUPER_CHAIN_APPLY_PROP,
  PROTOTYPE_IS_EXTENDED_PROP
} from './vars'

const _copyChain = (Extended, ProtoChain, chainPropName, ignoreExtended) => {
  //if chain on [Extended] has not been created yet
  if(!Extended.prototype[chainPropName])
    defProp(Extended.prototype, chainPropName, { value: [] })

  ProtoChain.forEach(Proto => {
    //console.log(!!Proto.prototype['__extended__'], Proto)
    //if [Proto] has been '__extended__' and has same-named proto chain, copy the Proto chain to Extended chain
    const isExtended = !!Proto.prototype[PROTOTYPE_IS_EXTENDED_PROP],
      hasSameChain = !!Proto.prototype[chainPropName]

    const alreadyInChain = Extended.prototype[chainPropName].some(P => (P === Proto)),
      shouldBePushed = (!isExtended || !ignoreExtended) && !alreadyInChain,
      shouldCopyChain = isExtended && hasSameChain

    if(shouldCopyChain)
      Proto.prototype[chainPropName].forEach(Proto => {
        //avoid pushing twice
        if(!Extended.prototype[chainPropName].some(P => (P === Proto))) {
          //console.log('pushed', Proto)
          Extended.prototype[chainPropName].push(Proto)
        }
      })

    if(shouldBePushed)
      Extended.prototype[chainPropName].push(Proto)
  })

  //console.log(Extended.prototype[chainPropName])
}

const _extend = (options = {}) => {
  if(!options.apply)
    options.apply = []
  if(!options.super)
    options.super = []

  const Child = options.super[0]

  if(!options.name)
    options.name = Child.name

  function Extended() {
    Extended.prototype[SUPER_CHAIN_APPLY_PROP].forEach(Super => {
      if(Super !== Extended)
        Super.apply(this, arguments)
    })
  }

  _named(options.name, Extended)

  defProp(Extended, 'prototype', { value: {} })
  defProp(Extended.prototype, 'constructor', { value: Child })
  defProp(Extended.prototype, PROTOTYPE_IS_EXTENDED_PROP, { value: true })

  options.super.forEach(Super => {
    function Proto() {}
    Proto.prototype = Super.prototype

    const proto = new Proto()

    for(let prop in proto)
      if(['constructor', PROTOTYPE_IS_EXTENDED_PROP, SUPER_CHAIN_PROTO_PROP, SUPER_CHAIN_APPLY_PROP].indexOf(prop) < 0)
        defProp(Extended.prototype, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        })
  })

  _copyChain(Extended, options.super, SUPER_CHAIN_PROTO_PROP, false)
  _copyChain(Extended, options.apply, SUPER_CHAIN_APPLY_PROP, true)

  return Extended
}

const extend = (...args) => _extend({ super: args, apply: args })

export { extend, _extend, _copyChain }
