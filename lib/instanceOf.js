import { SUPER_CHAIN_PROTO_PROP as superChainProp } from './vars'

const _lookThroughSuperChain = (obj, Proto, _checked) => {
  if(obj && obj[superChainProp] instanceof Array) {
    return obj[superChainProp].some(Super => {
      if(Super === Proto)
        return true
      if(_checked.some(Class => (Class === Super)))
        return false

      _checked.push(Super)

      return _lookThroughSuperChain(Super, Proto, _checked)
    })
  }
}

export default (instance, Proto) => {
  return instance instanceof Proto || !!_lookThroughSuperChain(instance.__proto__ || instance[superChainProp], Proto, [])
}
