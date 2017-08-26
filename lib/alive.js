let alive = null

const start = () => {
  let on = true
  if(!alive)
    alive = setInterval(() => {
      LED2.write(on)
      on = !on
    }, 500)
}

const stop = () => {
  if(alive) {
    clearInterval(alive)
    alive = null
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
