if(typeof console.time !== 'function') {
  const timers = {}

  console.time = label => {
    timers[label] = Date.now()
  }

  console.timeEnd = label => {
    if(label in timers) {
      console.log(`${ label }: ${ (Date.now() - timers[label]).toFixed(3) }ms`)
      delete timers[label]
    }
  }
}

if(typeof console.error !== 'function') {
  console.error = console.log
}

export default console
