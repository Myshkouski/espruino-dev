import arrayToBuffer from './arrayToBuffer'
import stringToBuffer from './stringToBuffer'

function toBuffer(iterable) {
  if(iterable instanceof Buffer || iterable instanceof Array)
		return arrayToBuffer(iterable)

	if(typeof iterable === 'string')
		return stringToBuffer(iterable)
}

export {
  toBuffer,
  arrayToBuffer,
  stringToBuffer
}
