const _superChain = (obj, Proto, _checked) => {
  if(obj && obj.super_ instanceof Array) {
    return obj.super_.some(Super => {
      if(Super === Proto)
        return true
      if(_checked.some(Class => (Class === Super)))
        return false

      _checked.push(Super)

      return _superChain(obj.super_, Super, _checked)
    })
  }
}

export default (instance, Proto) => {
  return instance instanceof Proto || !!_superChain(instance, Proto, [])
}
