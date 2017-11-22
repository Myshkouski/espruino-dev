Object.assign = (target, ...args) => {
  for(let i in args) {
    const obj = args[i]
    if(obj instanceof Object) {
      for(let key in obj) {
        target[key] = obj[key]
      }
    }
  }

  return target
}

export default Object
