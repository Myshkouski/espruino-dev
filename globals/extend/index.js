import {
  SUPER_CHAIN_PROTO_PROP,
  SUPER_CHAIN_APPLY_PROP,
  PROTOTYPE_IS_EXTENDED_PROP
} from './props'

export const _copyChain = (Extended, ProtoChain, chainPropName, ignoreExtended) => {
  //if chain on [Extended] has not been created yet
  if(!Extended.prototype[chainPropName]) {
    Object.defineProperty(Extended.prototype, chainPropName, { value: [] })
  }

  ProtoChain.forEach(Proto => {
    //console.log(!!Proto.prototype['__extended__'], Proto)
    //if [Proto] has been '__extended__' and has same-named proto chain, copy the Proto chain to Extended chain
    const isExtended = !!Proto.prototype[PROTOTYPE_IS_EXTENDED_PROP],
          hasSameChain = !!Proto.prototype[chainPropName]

    const alreadyInChain = Extended.prototype[chainPropName].some(P => P === Proto),
          shouldBePushed = (!isExtended || !ignoreExtended) && !alreadyInChain,
          shouldCopyChain = isExtended && hasSameChain

    if(shouldCopyChain)
      Proto.prototype[chainPropName].forEach(Proto => {
        //avoid pushing twice
        if(!Extended.prototype[chainPropName].some(P => P === Proto) ) {
          //console.log('pushed', Proto)
          Extended.prototype[chainPropName].push(Proto)
        }
      })

    if(shouldBePushed) {
      Extended.prototype[chainPropName].push(Proto)
    }
  })

  //console.log(Extended.prototype[chainPropName])
}

export const _extend = (options = {}) => {
  if(!options.apply)
    options.apply = []
  if(!options.super)
    options.super = []
  if(!options.static)
    options.static = []

  const Child = options.super[0]

  if(!options.name)
    options.name = Child.name

  function Extended() {
    Extended.prototype[SUPER_CHAIN_APPLY_PROP].forEach(Super => {
      if(Super !== Extended) {
        Super.apply(this, arguments)
      }
    })
  }

  _named(options.name, Extended)

  for(let i in options.static) {
    for(let prop in options.static[i]) {
      if('prototype' != prop) {
        Object.defineProperty(Extended, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        })
      }
    }
  }

  Object.defineProperty(Extended, 'prototype', { value: {} })
  Object.defineProperty(Extended.prototype, 'constructor', { value: Child })
  Object.defineProperty(Extended.prototype, PROTOTYPE_IS_EXTENDED_PROP, { value: true })

  for(let i in options.super) {
    function Proto() {}
    Proto.prototype = options.super[i].prototype
    const proto = new Proto()

    for(let prop in proto) {
      if(['constructor', PROTOTYPE_IS_EXTENDED_PROP, SUPER_CHAIN_PROTO_PROP, SUPER_CHAIN_APPLY_PROP].indexOf(prop) < 0) {
        Object.defineProperty(Extended.prototype, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        })
      }
    }
  }

  _copyChain(Extended, options.super, SUPER_CHAIN_PROTO_PROP, false)
  _copyChain(Extended, options.apply, SUPER_CHAIN_APPLY_PROP, true)

  return Extended
}

export const extend = (...args) => _extend({ super: args.slice(1), apply: args })
