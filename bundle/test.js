'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Buffer = _interopDefault(require('../../../../../home/alexei/Development/espruino-dev/globals/buffer.js'));

// import Bus from 'bus'
//
// const preamble = [1, 2, 3]
// const postamble = [4, 5, 6]
//
// const bus = new Bus({ read() {}, write() {}, setup() {} })
//
// bus.on('error', console.error)
//
// bus.rx([
//   preamble
// ], console.warn)
//
// bus.push(preamble)
const a = new Uint8Array([1, 2, 3]);

console.log(Buffer.from(a.buffer, 1, 1));
