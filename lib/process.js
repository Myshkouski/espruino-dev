import { planOnNextTick } from 'event-loop'

const _process = global.process || {}

if( !_process.nextTick )
  _process.nextTick = planOnNextTick

export default _process
