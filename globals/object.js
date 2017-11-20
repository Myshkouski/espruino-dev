Object.assign = (target, ...args) => {
  for(let obj of args) {
    if(obj instanceof Object)
      for(let key in obj) {
        target[key] = obj[key]
      }
  }

  return target
}

//Object.freeze = obj => obj

export default Object
