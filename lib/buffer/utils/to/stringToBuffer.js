import Proto from '../../proto'

export default function stringToUint8Array(str) {
	const arr = []

	for(let c in str)
		arr[c] = str.charCodeAt(c)

	return new Proto(arr)
}
