const Serial = require('serialport')
const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))

// console.log(argv)

if(!argv.platform) {
  throw new ReferenceError('Platform should be specified at arguments list')
}

const serial = new Serial(argv.port || '/dev/ttyUSB0', { baudRate: 115200 })

serial.on('open', () => {
  console.log('open')

  const onData = chunk => {
    console.log(chunk.toString())
  }

  serial.on('data', onData)

  serial.write('reset(true)\r\n')

  setTimeout(() => {

    const bundle = fs.createReadStream(path.resolve(process.cwd(), `bundle/index.${ argv.platform }.min.js`))

    bundle.pipe(serial)

    serial.write('\r\n')

    // serial.removeListener('data', onData)

    // process.stdin.pipe(serial).pipe(process.stdout)

    // process.stdin.resume()

    process.stdin.on('data', data => console.log('!', data))
  }, 1000)
})
