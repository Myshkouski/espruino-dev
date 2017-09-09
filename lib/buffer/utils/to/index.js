import Proto from '../../proto'

function toBuffer(iterable) {
  if(typeof iterable === 'string') {
    const arr = []

  	for(let c in str)
  		arr[c] = str.charCodeAt(c)

  	return new Proto(arr)
  }

  if(iterable instanceof Proto || iterable instanceof Array)
		return new Proto(arr)
}

export {
  toBuffer
}
