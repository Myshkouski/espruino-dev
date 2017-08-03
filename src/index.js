import { Readable } from 'stream'

if(!global.Buffer && global.ArrayBuffer)
	global.Buffer = global.ArrayBuffer
if(!global.LED1)
	global.LED1 = { write(value) { console.log('LED1', value ? '+' : '-') } }

const stream = new Readable()

stream.pipe({
	write(data) {
		console.log(data)
	}
})

stream.push('abc')
stream.push('def')

console.log(1)


/*
const stream = new Readable()

stream.on('data', data => {
	LED1.write(true)
	setTimeout(() => LED1.write(false), 200)
})

setInterval(() => stream.emit('data', '!'), 1000)
*/
