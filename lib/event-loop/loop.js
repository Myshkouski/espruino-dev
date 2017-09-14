function pushImmediate(queue) {
  for (let i = 0; i < queue.length; i++)
    queue[i]()
  queue.splice(0)
}

function pushToNextIteration(_queue) {
  const queue = [..._queue]
  _queue.splice(0)
  for (let i = 0; i < queue.length; i++)
    queue[i]()
}

const loop = {
  nextTick: { queue: [], handle: pushImmediate, timer: false },
  timeout: { queue: [], handle: pushToNextIteration, timer: false },
  immediate: { queue: [], handle: pushImmediate, timer: false }
}

export default loop
