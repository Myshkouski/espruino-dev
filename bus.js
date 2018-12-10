const bufferFrom = require('buffer-from')
const isBuffer = require('is-buffer')

const frame1 = new Uint8ClampedArray([0, 1, 2, 3, 4]),
  frame2 = new Uint8ClampedArray([5, 6, 7, 8, 9]),
  data = new Uint8ClampedArray([...frame1, ...frame2]),
  preamble = [1, 2, 3],
  header = [4, (byte, index, frame) => byte === 5, 6],
  trailer = 3,
  postamble = () => 3

const expected1 = [
  preamble,
  header,
  trailer,
  postamble
]

function _flattenAt(array, index) {
  return array.slice(0, index).concat(array[index]).concat(array.slice(1 + index))
}


function _resolve(chunk, index, expected) {
  let expectedByte = expected[0][expected[1]]

  if (expectedByte instanceof Function) {
    expectedByte = expectedByte.call(undefined, chunk[index], expected[1], expected[0])

    if (typeof expectedByte === 'string') {
      expectedByte = bufferFrom(expectedByte)
    }

    if (isBuffer(expectedByte)) {
      expectedByte = Array.from(expectedByte)
    }

    if (Array.isArray(expectedByte)) {
      expected[0] = _flattenAt(expected[0], expected[1])
      expectedByte = expectedByte[0]
    }
  }

  // console.log(expectedByte, chunk[index])

  if (expectedByte === undefined || expectedByte === chunk[index]) {
    expected[0][expected[1]++] = chunk[index]

    return 1
  }

  return 0
}

function _toConsumablePattern(pattern) {
  pattern = pattern.slice(0, pattern.length)

  for (let index = 0; index < pattern.length;) {
    const byte = pattern[index]

    if (typeof pattern[index] === 'string') {
      pattern[index] = Array.from(bufferFrom(pattern[index]))
    } else if (Array.isArray(byte)) {
      pattern = _flattenAt(pattern, index)
    } else {
      index++
    }
  }

  // if (options.stringify) {
  //   for (let index = 0; index < pattern.length; index++) {
  //     const byte = pattern[index]
  //
  //     if (!isNaN(byte)) {
  //       if (typeof pattern[index - 1] === 'string') {
  //         pattern[index - 1] += pattern[index]
  //         pattern.splice(index, 1)
  //         index--
  //       } else {
  //         pattern[index] = '' + pattern[index]
  //       }
  //     }
  //   }
  // }

  return pattern
}

const pattern = [
  '0123',
  (byte, index, chunk) => {
    return '4'
  },
  new Array(4),
  '9'
]

const consumablePattern = _toConsumablePattern(pattern)

const _expected = [
  // [ array, consumed ]
  [[...consumablePattern], 0]
]

const D = '---'

function _consumeChunk(chunk) {
  if (typeof chunk === 'string') {
    chunk = bufferFrom(chunk)
  }

  for (let _expectedIndex = 0; _expectedIndex < _expected.length; _expectedIndex++) {
    const expected = _expected[_expectedIndex]

    for (let index = 0; index < chunk.length;) {
      const match = _resolve(chunk, index, expected)

      if (!match) {
        expected.splice(_expectedIndex, 1)

        throw index
      }

      if (expected[0].length === expected[1]) {
        _expected.splice(0, _expected.length)

        return expected[0]
      }

      index += match
    }
  }

  return null
}

const EventEmitter = require('events')

class Bus extends EventEmitter {
  constructor() {
    super()

    this.transport = options.transport
    this.type = options.type
    this._setup = options.setup.bind(this)
    this._read = length => options.read.call(this, length === undefined ? length : this.options.highWaterMark)
    this._write = options.write.bind(this)

    this.options = {
      highWaterMark: options.highWaterMark || DEFAULT_HIGHWATERMARK
    }

    this._watching = []
    this._patterns = []
  }

  push(chunk) {
    // console.log( 'push()' )
    // console.log( chunk )
    if (chunk.length) {
      this._busState.push(chunk)

      if (!this._busState.ticker) {
        this._busState.ticker = true
        setImmediate(() => {
          this._busState.ticker = false
          _push.call(this)
        })
      }
    }
    // const highWaterMark = this.options.highWaterMark,
    //       parse = _parse.bind(this)
    //
    // if(chunk.length > highWaterMark) {
    //   const chunks = []
    //   let subchunkIndex = 0
    //
    //   for(let bytesLeft = chunk.length, offset = 0; bytesLeft > 0; bytesLeft -= highWaterMark) {
    //     const subchunk = chunk.slice(offset, offset += highWaterMark)
    //     chunks.push(subchunk)
    //   }
    //
    //   series(chunks, (next, subchunk) => {
    //     parse(subchunk)
    //     next()
    //   })
    // }
    // else {
    //   parse(chunk)
    // }
  },

  watch(list, cb) {
    const watcher = _resetWatcher({
      list,
      callback: cb.bind(this)
    })

    this._watching.push(watcher)

    return watcher
  },

  unwatch(watcher) {
    if (watcher) {
      const index = this._watching.indexOf(watcher)

      if (index >= 0) {
        this._watching.splice(index, 1)
      }
    } else {
      this._watching.splice(0)
    }

    return this
  },

  /**
    @TODO Promise interface
  */

  expect(list, ...args) {
    let cb, options = {}

    if (typeof args[0] == 'function') {
      cb = args[0]
    } else if (typeof args[1] == 'function') {
      cb = args[1]
      Object.assign(options, args[0])
    } else {
      throw new ReferenceError('Callback is not provided')
    }

    let watcher
    const setWatcher = () => {
      watcher = this.watch(list, (...args) => {
        this.unwatch(watcher)
        cb.apply(this, args)
      })
      this._read(this.options.highWaterMark)
    }

    // if ( 'timeout' in options ) {
    //   setTimeout( setWatcher, options.timeout )
    // } else {
    //
    // }

    setWatcher()

    return watcher
  },

  send(binary, options = {}) {
    if ('timeout' in options) {
      setTimeout(() => {
        this._write(binary)
      }, options.timeout)
    } else {
      this._write(binary)
    }

    return this
  },

  reset() {
    this._watching.splice(0)
    return this
  }
}

// let chunk = data.reduce((string, byte) => string + byte, '')
//
// try {
//   const time = process.hrtime()
//   const consumed = _consumeChunk(chunk)
//   const diff = process.hrtime(time)
//   console.log('found', consumed)
//   console.log(`Benchmark took ${diff[0] * 1e9 + diff[1]} nanoseconds`)
// } catch (index) {
//   console.error('not match at position', index, 'of chunk', chunk)
// }
