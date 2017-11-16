Array.prototype.concat = function () {
  const concatenated = []

  for(let i in this) {
    concatenated.push(this[i])
  }

  for(let i in arguments) {
    for(let j in arguments[i]) {
      concatenated.push(arguments[i][j])
    }
  }

  return concatenated
}

export default Array
