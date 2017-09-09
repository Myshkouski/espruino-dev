import { planImmediate } from 'event-loop'

const _setImmediate = global.setImmediate || planImmediate

export default _setImmediate
