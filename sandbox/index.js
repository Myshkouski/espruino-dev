import Bytes from 'bytes'

const bus = new Bytes()

const frame = [0, 255, 0, 255, 255, 0]
const data = frame.slice(0, 3).concat(frame)//frame.slice(0, 1)//.concat([1])

console.log(frame)
console.log(data)

bus.watch([frame], data => console.log(data))

bus.on('error', err => console.error(err))

bus.write(data)
