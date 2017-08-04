const { exec, spawn } = require('child_process')

exec('webpack --config build/webpack.config.js --watch')

setTimeout( () => exec('espruino -w bundle/index.esp.js'), 1000)
