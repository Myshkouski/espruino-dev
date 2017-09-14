const callN = (n, f, _initially, _finally) => {
  return function() {
    if(n > 0) {
      n--
      f.apply(this, arguments)
    }
    if(n < 0) {
      if (f)
        f = undefined
    }
  }
}

export default callN
