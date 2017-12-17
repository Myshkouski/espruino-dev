let defaultLed
let ON = 1,
  OFF = 0

if (process.env.CHIP.toUpperCase() == 'ESP32') {
  defaultLed = D5
  ON = 0
  OFF = 1
} else {
  defaultLed = LED2
}

let status = false
const defaultTimeout = 20

export const once = (led, timeout, cb) => {
  // D5.write(0)
  // console.log('on')
  led.write(ON)
  setTimeout(() => {
    // D5.write(1)
    // console.log('off')
    led.write(OFF)
    cb && cb()
  }, timeout || defaultTimeout)
}

export const start = led => {
  if (!led) {
    led = defaultLed
  }
  if (!status) {
    status = true

    once(led, defaultTimeout, function cb() {
      if (status) {
        setTimeout(() => {
          once(led, defaultTimeout, cb)
        }, 1000 - defaultTimeout)
      }
    })
  }
}

export const stop = () => {
  if (status) {
    status = false
  }
}
