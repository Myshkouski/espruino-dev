import loop from './loop'

let timer = false

function asyncCall(cb) {
  setTimeout(cb)
}

function asyncFlush() {
  for (let i in loop) {
    loop[i].handle(loop[i].queue)
    loop[i].timer = timer = false
  }
}

function defer(stage, cb) {
  stage.queue.push(cb)

  if (!timer && !stage.timer) {
    stage.timer = timer = true
    asyncCall(asyncFlush)
  }
}

export default defer
