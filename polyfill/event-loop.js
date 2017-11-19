const PUSH_TO_QUEUE_IMMEDIATE = !0,
      PUSH_AT_NEXT_STAGE = !1,
      loop = [
        // nextTick
        { queue: [], handle: PUSH_TO_QUEUE_IMMEDIATE, tick: false },
        // immediate
        { queue: [], handle: PUSH_TO_QUEUE_IMMEDIATE, tick: false },
        // timeout
        { queue: [], handle: PUSH_AT_NEXT_STAGE, tick: false }
      ]

let tick = false,
    timers = {}

const asyncFlush = () => {
  for (let stage in loop) {
    if(loop[stage].queue.length) {
      if(loop[stage].handle == PUSH_TO_QUEUE_IMMEDIATE) {
        for (let exec = 0; exec < loop[stage].queue.length; exec ++) {
          loop[stage].queue[exec]()
        }
        loop[stage].queue.splice(0)
      } else /*if(loop[stage].handle == PUSH_AT_NEXT_STAGE)*/ {
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

const nextTick = asyncCall(/* .nextTick */0)

const setImmediate = asyncCall(/* .immediate */1)

const timeoutCall = asyncCall(/* .timeeout */2)

const _setTimeout = (cb, timeout) => {
  let index = 0
  while(timers[index]) {
    index++
  }
  timers[index] = setTimeout(() => {
    if(timers[index]) {
      delete timers[index]
      timeoutCall(cb)
    }
  }, timeout)

  return index
}

const setInterval = (cb, timeout) => {
  return (function setTimer() {
    return _setTimeout(() => {
      cb()
      setTimer()
    }, timeout)
  })()
}

export {
  nextTick,
  setImmediate,
  _setTimeout as setTimeout,
  setInterval
}
