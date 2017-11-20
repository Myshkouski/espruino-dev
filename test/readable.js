import { Readable } from 'stream'
import { deepEqual } from 'assert'

const createReadable = (iterable = []) => {
  const buffer = new Uint8Array(iterable)

  function read(length) {
    this.push(buffer)
    this.push(null)
  }

  return new Readable({ read })
}


describe('Readable', () => {
  describe('read()', () => {
    const readable = createReadable([1, 2, 3])

    it('should return all buffered data', () => {
      deepEqual(readable.read(), [1, 2, 3])
    })
  })
})
