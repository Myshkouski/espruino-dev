import Duplex from './Duplex'

function _read(size) {
  //console.log('_read()')
  //dumb function
}

function _Transform(options = {}) {
  Duplex.call(this, Object.assign({}, options, {
    read: _read,
    write: options.transform
  }))
}

const Transform = _extend({
	name: 'Transform',
  super: [Duplex],
  apply: [_named('Transform', _Transform)]
})

export default Transform
