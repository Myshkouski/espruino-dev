import Proto from 'buffer/proto'

export default function arrayToBuffer(arr) {
	return new Proto(arr)
}
