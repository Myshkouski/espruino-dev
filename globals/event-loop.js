const loop = [
  // immediate
  { queue: [], immediatePush: true, tick: false },
  // timeout
  { queue: [], immediatePush: false, tick: false }
]

let tick = false

const asyncFlush = () => {
  for (let stage in loop) {
    if(loop[stage].queue.length) {
      if(loop[stage].immediatePush) {
        for (let exec = 0; exec < loop[stage].queue.length; exec ++) {
          loop[stage].queue[exec]()
        }
        loop[stage].queue.splice(0)
      } else {
        const queue = loop[stage].queue.splice(0)
        for (let exec = 0; exec < queue.length; exec ++) {
          queue[exec]()
        }
      }
    }

    loop[stage].tick = tick = false
  }
}

const asyncCall = stage => cb => {
  loop[stage].queue.push(cb)

  if (!tick && !loop[stage].tick) {
    loop[stage].tick = tick = true

    setTimeout(asyncFlush)
  }
}

const setImmediate = asyncCall(/* .immediate */0)

const timeoutCall = asyncCall(/* .timeeout */1)

export const _setTimeout = (cb, timeout) => setTimeout(() => { timeoutCall(cb) }, timeout)

export const _setInterval = (cb, timeout) => (function setTimer() {
  return _setTimeout(() => {
    setTimer()
    cb()
  }, timeout)
})()

export {
  setImmediate,
  _setTimeout as setTimeout,
  _setInterval as setInterval
}
