import Bus from 'bus'
import { deepEqual } from 'assert'

const frame1 = new Uint8ClampedArray([0, 1, 2, 3, 4]),
      frame2 = new Uint8ClampedArray([5, 6, 7, 8, 9])

describe('Readable', () => {
  describe('read()', () => {
    const bus = new Bus({ setup() {} })

    it('should return all buffered data', () => {
      bus.rx([
        frame1,
        frame2
      ], frame => {
        deepEqual(frame.length, 10)
      })

      bus.write([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })
})
