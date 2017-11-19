import Readable from 'stream/readable'

const buffer = new Uint8Array([1, 2, 3])

function read(length) {
  console.log(length)
  this.push(buffer.slice(0, length))
  this.push(null)
}

const readable = new Readable({ read })

console.log(readable.read())
console.log('!')
