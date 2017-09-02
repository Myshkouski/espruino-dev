import {
  SUPER_CHAIN_PROTO_PROP,
  SUPER_CHAIN_APPLY_PROP
} from './vars'

const _extend = (options = {}) => {
  if(!options.apply)
    options.apply = []
  if(!options.super)
    options.super = []

  const Child = options.super[0]

  function Extended() {
    options.apply.forEach(Super => Super.apply(this, arguments))
  }

  defProp(Extended, 'name', { get: () => Child.name })
  defProp(Extended, 'prototype', { value: {} })

  options.super.forEach(Super => {
    function Proto() {}
    Proto.prototype = Super.prototype

    const proto = new Proto()

    for(let prop in proto)
      if(prop !== SUPER_CHAIN_PROTO_PROP)
        defProp(Extended.prototype, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        })
  })

  defProp(Extended.prototype, 'constructor', { value: Child })
  defProp(Extended.prototype, SUPER_CHAIN_PROTO_PROP, { value: options.super })
  defProp(Extended.prototype, SUPER_CHAIN_APPLY_PROP, { value: options.apply })

  return Extended
}

const extend = (...args) => _extend({ super: args, apply: args })

export { extend, _extend }
