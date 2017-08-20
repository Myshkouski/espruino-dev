if(!global.process.nextTick)
  global.process.nextTick = global.setImmediate

export default global.process
