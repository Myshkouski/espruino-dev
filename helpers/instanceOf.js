import { SUPER_CHAIN_PROTO_PROP } from './vars'

export default (instance, Super) => {
  if(instance instanceof Super)
    return true

  if(Super === Object && instance instanceof Function)
    return true

  if(instance.__proto__) {
    if(instance.__proto__ === Super.prototype)
      return true

    if(instance.__proto__[SUPER_CHAIN_PROTO_PROP] instanceof Array)
      return instance.__proto__[SUPER_CHAIN_PROTO_PROP].some(Proto => (Proto === Super))
  }

  return false
}
