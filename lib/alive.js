let alive = null
const defaultInterval = 200

const blink = (led, on = defaultInterval, off = on * 5) => {
  led.write(true)
  setTimeout(() => {
    led.write(false)
    if(alive)
      setTimeout(() => blink(led, on, off), off)
  }, on)
}

const start = (...args) => {
  let on = true
  if(!alive) {
    alive = true
    blink(LED2)
  }
}

const stop = () => {
  if(alive) {
    alive = false
  }
}

export default (mode, onTimeout, offTimeout) => {
  if(mode === undefined)
    mode = !alive

  !mode
    ? stop()
    : start()

  return !!alive
}
