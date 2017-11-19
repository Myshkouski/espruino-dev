import BufferState from 'stream/bufferState'
import { deepEqual } from 'assert'

const createBufferState = () => {
  const chunks = [
    new Uint8Array([1, 2, 3, 4, 5]),
    new Uint8Array([6, 7, 8, 9, 10]),
    new Uint8Array([5, 6, 9, 4, 7])
  ]
  const state = new BufferState()
  chunks.forEach(chunk => state.push(chunk))

  return state
}

describe('BufferState', () => {
  describe('at()', () => {
    const state = createBufferState()

    it('should point at right "index" and "nodeIndex"', () => {
      deepEqual(state.at(0), { index: 0, nodeIndex: 0 })
      deepEqual(state.at(7), { index: 2, nodeIndex: 1 })
    })

    it('should return undefined if nonexistent position passed', () => {
      deepEqual(state.at(-100), undefined)
      deepEqual(state.at(100), undefined)
    })
  })

  describe('buffer()', () => {
    const state = createBufferState(),
          spliced = new Uint8Array([1, 2, 3, 4, 5, 6, 7]),
          splicedLength = 7

    it('should return spliced buffer', () => {
      deepEqual(state.buffer(splicedLength), spliced)
    })
  })
})
