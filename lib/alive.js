let alive

const start = () => {
  let on = true
  alive = setInterval(() => {
    LED2.write(on)
    on = !on
  }, 500)
}

const stop = () => {
  if(alive)
    clearInterval(alive)
}

export default mode => {
  if(mode === undefined)
    mode = !alive

  !mode
    ? stop()
    : start()

  return !!alive
}
