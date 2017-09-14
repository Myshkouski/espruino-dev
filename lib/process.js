import nextTick from 'nextTick'

const _process = typeof process !== 'undefined' ? process : {}

_process.nextTick = typeof _process.nextTick !== 'undefined' ? _process.nextTick : nextTick

export default _process
