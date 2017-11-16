import Proto from './proto'
import { toBuffer } from './utils/to'

const TYPED_ARRAY_TYPES = [
	Int8Array, Uint8Array, Uint8ClampedArray,
	Int16Array, Uint16Array,
	Int32Array, Uint32Array, Float32Array,
	Float64Array
]

function copy(target) {
	const targetStart 	= arguments[1] !== undefined ? arguments[1] : 0,
				sourceStart 	= arguments[2] !== undefined ? arguments[2] : 0,
				sourceEnd 		= arguments[3] !== undefined ? arguments[3] : source.length

	let copied = 0

	for(let sourceIndex = sourceStart, targetIndex = targetStart; sourceIndex < sourceEnd; sourceIndex++, targetIndex++, copied++)
		target.set([ this[sourceIndex] ], targetIndex)

	return copied
}

function Buffer() {
	throw new Error('Buffer constructor is deprecated. Use Buffer.from() instead.')
}

Buffer.from = function _createBuffer() {
	let iterable = []
	if(typeof arguments[0] == 'string') {
    for(let c in arguments[0]) {
  		iterable[c] = arguments[0].charCodeAt(c)
			/*iterable[c] = (arguments[0][c] >= 0x20 && arguments[0][c] <= 0x7F)
				? arguments[0].charCodeAt(c)
				: 0x00*/
		}
  } else if(arguments[0] instanceof Array || TYPED_ARRAY_TYPES.some(Proto => arguments[0] instanceof Proto)) {
		iterable = arguments[0]
	}

	if('1' in arguments) {
		const offset = arguments[1] !== undefined ? arguments[1] : 0,
					length = arguments[2] !== undefined ? arguments[2] : iterable.length,
					array = []

		for(let i = offset;i--;)
			array[i] = 0

		for(let i = 0; (i < iterable.length) && (i < length); i++)
			array[offset + i] = iterable[i]

		for(let i = array.length; i < length; i++)
			array[i] = 0

		return new Proto(array)
	}

	return new Proto(iterable)
}

Buffer.concat = function concat() {
	const list = arguments[0] || [],
		totalLength = arguments[1] !== undefined ? arguments[1] : list.reduce((totalLength, array) => (totalLength + array.length), 0)

	let buffer = Buffer.from([], 0, totalLength),
		offset = 0

	list.forEach(buf => {
		buffer.set(buf, offset)
		offset += buf.length
	})

	return buffer
}

export default Buffer
