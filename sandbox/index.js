

setTimeout(() => console.log('timeout'), 0)

process.nextTick(() => console.log('nextTick'))

setImmediate(() => console.log('immediate'))

new Promise(resolve => console.log('promise'))
