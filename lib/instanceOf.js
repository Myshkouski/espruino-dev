import { SUPER_CHAIN_PROTO_PROP } from './vars'

const _lookThroughSuperChain = (Proto, Super, _checked) => {
  if(Proto) {
    if(Proto === Super.prototype)
      return true

    if(Proto[SUPER_CHAIN_PROTO_PROP] instanceof Array) {
      return Proto[SUPER_CHAIN_PROTO_PROP].some(Proto => {
        if(Proto === Super.prototype)
          return true
        if(_checked.some(Class => (Class === Proto)))
          return false

        _checked.push(Proto)

        return _lookThroughSuperChain(Proto.prototype, Super, _checked)
      })
    }
  }
}

export default (instance, Super) => {
  return instance instanceof Super || (instance && !!_lookThroughSuperChain(instance.__proto__, Super, []))
}
