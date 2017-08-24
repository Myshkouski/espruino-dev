if(!process.nextTick) {
  process.nextTick = setImmediate
}

export default process
