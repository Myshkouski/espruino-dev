let status = false
const defaultInterval = 20

function blink(mode) {
  if(mode === undefined)
    mode = !status

  !mode
    ? blink.stop()
    : blink.start()

  return !!status
}

blink.start = () => {
  if(!status) {
    status = true

    blink.once(LED2, 20, function cb() {
      if(status)
        setTimeout(() => blink.once(LED2, 20, cb), 980)
    })
  }
}

blink.stop = () => {
  if(status) {
    status = false
  }
}

blink.once = (led, on = 20, cb) => {
  led.write(true)
  setTimeout(() => {
    led.write(false)
    cb && cb()
  }, on)
}

export default blink
