import Transform from './transform'

function _transform(data, encoding, cb) {
  this.push(data, encoding)
  cb()
}

function _PassThrough(options = {}) {
  Transform.call(this, {
    highWaterMark: options.highWaterMark,
    transform: _transform
  })
}

const PassThrough = _extend({
  super: [Transform],
  apply: [_PassThrough]
})

export default PassThrough
