if(global.setImmediate)
  module.exports = setImmediate
else
  module.exports = f => setInterval(f, 0)
