const _setImmediate = global.setImmediate || (f => setTimeout(f, 0))

export default _setImmediate
