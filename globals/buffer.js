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

const Proto = Uint8Array

function Buffer() {
  throw new Error('Buffer proto is deprecated. Use Buffer.from() instead.')
}

Buffer.isBuffer = function (value) {
  return value instanceof Proto
}

Buffer.from = function from(iterable, offset, length) {
  if (typeof iterable == 'string') {
    const parsed = []

    for (let c in iterable) {
      parsed[c] = iterable.charCodeAt(c)
    }

    return new Proto(parsed)
  } else if (Array.isArray(iterable) || this.isBuffer(iterable)) {
    return new Proto(iterable)
  } else if (iterable instanceof ArrayBuffer) {
    offset = offset !== undefined ? offset : 0
    length = length !== undefined ? length : iterable.byteLength
    return new Proto(iterable.slice(offset, offset + length))
  } else {
    throw new TypeError('Cannot create buffer from', typeof iterable)
  }
}

Buffer.concat = function concat(_list, _totalLength) {
  const list = _list || [],
    totalLength = _totalLength !== undefined ? _totalLength : list.reduce((totalLength, array) => totalLength + array.length, 0),
    buffer = this.from([], 0, totalLength)

  list.reduce((offset, buf) => {
    buffer.set(buf, offset)
    return offset + buf.length
  }, 0)

  return buffer
}

module.exports = Buffer
