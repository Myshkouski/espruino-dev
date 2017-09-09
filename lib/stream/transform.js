import Duplex from './Duplex'

function _read(size) {
  //console.log('_read()')
  //dumb function
}

function _write(data, encoding, cb) {
  //console.log('_write(' + data + ')')
  return this._transform(data, encoding, cb)
}

function _Transform(options = {}) {
  Duplex.call(this, {
    read: _read,
    write: _write,
    highWaterMark: options.highWaterMark
  })

  this._transform = options.transform.bind(this)
}

const Transform = _extend({
	name: 'Transform',
  super: [Duplex],
  apply: [_Transform]
})

export default Transform
