function _createBuffer(iterable) {
	let 	offset = arguments[1] !== undefined ? arguments[1] : 0,
				length = arguments[2] !== undefined ? arguments[2] : iterable.length

	const array = []

	for(let i = offset;i--;)
		array[i] = 0

	for(let i = 0; (i < iterable.length) && (i < length); i++)
		array[offset + i] = iterable[i]

	for(let i = array.length; i < length; i++)
		array[i] = 0

	const buffer = new Uint8Array(array)

	Object.defineProperties(buffer, {
		copy: {	value: copy }
	})

	return buffer
}

function copy(target) {
	const source = this,
				targetStart 	= arguments[1] !== undefined ? arguments[1] : 0,
				sourceStart 	= arguments[2] !== undefined ? arguments[2] : 0,
				sourceEnd 		= arguments[3] !== undefined ? arguments[3] : source.length

	let copied = 0

	for(let sourceIndex = sourceStart, targetIndex = targetStart; sourceIndex < sourceEnd; sourceIndex++, targetIndex++, copied++)
		target.set([ source[sourceIndex] ], targetIndex)

	return copied
}

function Buffer() {
	throw new Error('Buffer constructor is deprecated. Use Buffer.from() instead.')
}

Buffer.from = function from() {
	return _createBuffer.apply(null, arguments)
}

Buffer.concat = function concat() {
	const list = arguments[0] || []
	const totalLength = arguments[1] !== undefined ? arguments[1] : list.reduce((totalLength, array) => (totalLength + array.length), 0)

	let buffer = _createBuffer([], 0, totalLength)
	let offset = 0

	for (let buf of list) {
			buffer.set(buf, offset)
			offset += buf.length
	}

	return buffer
}

export default Buffer
