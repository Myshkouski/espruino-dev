if(global.setImmediate)
  module.exports = global.setImmediate
else
  module.exports = f => setInterval(f, 0)
