import { nextTick } from 'event-loop'

const _process = typeof process !== 'undefined' ? process : {}

_process.nextTick = typeof _process.nextTick !== 'undefined' ? _process.nextTick : nextTick

export default _process
