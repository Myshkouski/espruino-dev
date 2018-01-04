'use strict';

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
//
function Buffer() {
  throw new Error()
}

//Buffer.from = (iterable, offset, length) => E.toUint8Array(iterable)

Buffer.from = (iterable, offset, length) => {
  if (typeof iterable == 'string') {
    const parsed = [];

    for (let c in iterable) {
      parsed[c] = iterable.charCodeAt(c);
    }

    return new Uint8Array(parsed)
  } else if (iterable instanceof ArrayBuffer) {
    return new Uint8Array(iterable.slice(offset !== undefined ? offset : 0, offset + (length !== undefined ? length : iterable.length)))
  } else if (iterable instanceof Array || iterable instanceof Uint8Array) {
    return new Uint8Array(iterable)
  } else {
    throw new TypeError('Cannot create buffer from', typeof iterable)
  }
};

Buffer.concat = (_list, _totalLength) => {
  const list = _list || [],
    totalLength = _totalLength !== undefined ? _totalLength : list.reduce((totalLength, array) => totalLength + array.length, 0),
    buffer = Buffer.from([], 0, totalLength);

  list.reduce((offset, buf) => {
    buffer.set(buf, offset);
    return offset + buf.length
  }, 0);

  return buffer
};

// import Bus from 'bus'
//
// const preamble = [1, 2, 3]
// const postamble = [4, 5, 6]
//
// const bus = new Bus({ read() {}, write() {}, setup() {} })
//
// bus.on('error', console.error)
//
// bus.rx([
//   preamble
// ], console.warn)
//
// bus.push(preamble)
const a = new Uint8Array([1, 2, 3]);

console.log(Buffer.from(a.buffer, 1, 1));
