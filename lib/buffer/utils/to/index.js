import Proto from '../../proto'
import arrayToBuffer from './arrayToBuffer'
import stringToBuffer from './stringToBuffer'

function toBuffer(iterable) {
  if(typeof iterable === 'string')
    return stringToBuffer(iterable)

  if(iterable instanceof Proto || iterable instanceof Array)
		return arrayToBuffer(iterable)
}

export {
  toBuffer,
  arrayToBuffer,
  stringToBuffer
}
