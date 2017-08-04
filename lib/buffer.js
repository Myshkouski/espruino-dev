function stringToUint8Array(str) {
	const arr = []

	for(let c in str)
		arr[c] = str[c].charCodeAt()

	return new Uint8Array(arr)
}

function concatenateUint8Arrays() {
	let totalLength = 0;
  for (let a in arguments)
  	totalLength += arguments[a].length;

  let result = new Uint8Array(totalLength);

  let offset = 0;
  for (let a in arguments) {
      result.set(arguments[a], offset);
      offset += arguments[a].length;
  }
  return result;
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

Uint8Array.prototype.concat = function concat() {
	const arrays = [ this ]
  for (let a in arguments)
		arrays.push(arguments[a])

	return concatenateUint8Arrays.apply(this, arrays)
}

module.exports = Uint8Array
