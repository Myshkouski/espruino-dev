const _process = global.process || {}

if( !_process.nextTick )
  _process.nextTick = setImmediate

export default _process
