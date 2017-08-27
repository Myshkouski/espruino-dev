import { Duplex, Writable, Readable } from 'stream'

const d = new Duplex({
  read() {}, write(d, e, cb) {
    this.push(d)
    cb()
  }
})

console.log(!!d.read, !!d.write)
console.log(d instanceof Writable)

d.write('!')
d.read(10)

alive()
