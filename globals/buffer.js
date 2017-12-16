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

Buffer.from = (_iterable, _offset, _length) => {
	let iterable = []
	if(typeof _iterable == 'string') {
    for(let c in _iterable) {
			iterable[c] = _iterable.charCodeAt(c)
		}
  } else if(_iterable instanceof Uint8Array || _iterable instanceof Array) {
		iterable = _iterable
	}

	const offset = _offset !== undefined ? _offset : 0
	const length = _length !== undefined ? _length : iterable.length

	return new Uint8Array([...[].fill(0, 0, offset), ...[].slice.call(iterable, 0), ...[].fill(0, iterable.length + offset, length)])
}

Buffer.concat = (_list, _totalLength) => {
	const list = _list || [],
				totalLength = _totalLength !== undefined ? _totalLength : list.reduce((totalLength, array) => totalLength + array.length, 0),
				buffer = Buffer.from([], 0, totalLength)

	list.reduce((offset, buf) => {
		buffer.set(buf, offset)
		return offset + buf.length
	}, 0)

	return buffer
}

export default Buffer
