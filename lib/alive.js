let alive = null
const defaultInterval = 20

const blink = (led, on = 20, off = 1000 - defaultInterval) => {
  led.write(true)
  setTimeout(() => {
    led.write(false)
    if(alive)
      setTimeout(() => blink(led, on, off), off)
  }, on)
}

const start = () => {
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

export default mode => {
  if(mode === undefined)
    mode = !alive

  !mode
    ? stop()
    : start()

  return !!alive
}
