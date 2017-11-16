const timers = {}

function time(label) {
  timers[label] = Date.now()
}

function timeEnd(label) {
  if(label in timers) {
    console.log(`${ label }: ${ (Date.now() - timers[label]).toFixed(3) }ms`)
    delete timers[label]
  }
}

if(typeof console.time !== 'function') {
  console.time = time
  console.timeEnd = timeEnd
}

if(typeof console.error !== 'function') {
  console.error = console.log
}

export default console
