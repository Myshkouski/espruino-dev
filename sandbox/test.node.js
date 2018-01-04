import { Bus } from 'nfc'
// import Bus from 'bus'

const transport = {
  buffer: Buffer.from([]),
  read(length) {
    const chunk = this.buffer.slice(0, length)
    this.buffer = Buffer.from(this.buffer, length)
    return chunk
  },

  write(chunk) {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(chunk)])
  }
}

const preamble = [1, 2, 3]
const postamble = [4, 5, 6]

const bus = new Bus({ read() {
  console.log(this)
  const chunk = this.transport.read(length)
  return chunk
}, write(chunk) {
  this.transport.write(chunk)
}, setup() {
  this.on('error', console.error)
} })

bus.setup({
  transport
})

bus.rx([frame => {
  console.log(frame)
  return [[preamble.length]]
}], console.warn)

bus.tx(preamble)
