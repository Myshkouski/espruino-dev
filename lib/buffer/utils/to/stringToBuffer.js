export default function stringToUint8Array(str) {
	const arr = []

	for(let c in str)
		arr[c] = str[c].charCodeAt()

	return new Uint8Array(arr)
}
