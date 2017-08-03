function stringToUint8Array(str) {
	const arr = []

	for(let c in str)
		arr[c] = str[c].charCodeAt()

	return new Uint8Array(arr)
}

function toUint8Array(chunk) {
	if(chunk instanceof Uint8Array)
		return chunk
	if(typeof chunk === 'string')
		return stringToUint8Array(chunk)
}

Uint8Array.from = function from(iterable) {
	return toUint8Array(iterable)
}

module.exports = Uint8Array