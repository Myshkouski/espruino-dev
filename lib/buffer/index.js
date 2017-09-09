import Proto from './proto'
import { toBuffer } from './utils/to'

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
	//console.log(arguments)
	let iterable = []
	if(typeof arguments[0] === 'string') {
    for(let c in arguments[0])
  		iterable[c] = arguments[0].charCodeAt(c)

  	iterable = new Proto(iterable)
  }

  else if(arguments[0] instanceof Proto || arguments[0] instanceof Array)
		iterable = new Proto(arguments[0])

	const offset = arguments[1] !== undefined ? arguments[1] : 0,
		length = arguments[2] !== undefined ? arguments[2] : iterable.length

	const array = []

	for(let i = offset;i--;)
		array[i] = 0

	for(let i = 0; (i < iterable.length) && (i < length); i++)
		array[offset + i] = iterable[i]

	for(let i = array.length; i < length; i++)
		array[i] = 0

	const buffer = new Proto(array)

	return buffer
}

Buffer.concat = function concat() {
	const list = arguments[0] || [],
		totalLength = arguments[1] !== undefined ? arguments[1] : list.reduce((totalLength, array) => (totalLength + array.length), 0)

	let buffer = _createBuffer([], 0, totalLength),
		offset = 0

	list.forEach(buf => {
		buffer.set(buf, offset)
		offset += buf.length
	})

	return buffer
}

export default Buffer
