// import Uint8Array from './Uint8Array'
// import { toBuffer } from './utils/to'

// function copy(target) {
// 	const targetStart 	= arguments[1] !== undefined ? arguments[1] : 0,
// 				sourceStart 	= arguments[2] !== undefined ? arguments[2] : 0,
// 				sourceEnd 		= arguments[3] !== undefined ? arguments[3] : source.length
//
// 	let copied = 0
//
// 	for(let sourceIndex = sourceStart, targetIndex = targetStart; sourceIndex < sourceEnd; sourceIndex++, targetIndex++, copied++)
// 		target.set([ this[sourceIndex] ], targetIndex)
//
// 	return copied
// }

const isBuffer = require('is-buffer')

module.exports = function bufferFrom(iterable, offset, length) {
  if (typeof iterable == 'string') {
    const array = new Uint8Array(iterable.length)

    for (let c in iterable) {
      array[c] = iterable.charCodeAt(c)
    }

    return array
  }

  if (Array.isArray(iterable) || isBuffer(iterable)) {
    return new Uint8Array(iterable)
  }

  if (iterable instanceof ArrayBuffer) {
    offset = offset !== undefined ? offset : 0
    length = length !== undefined ? length : iterable.byteLength
    return new Uint8Array(iterable.slice(offset, offset + length))
  }

  throw new TypeError('Cannot create buffer from', typeof iterable)
}
