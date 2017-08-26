if(global.setImmediate)
  module.exports = setImmediate
else
  module.exports = f => setTimeout(f, 0)
