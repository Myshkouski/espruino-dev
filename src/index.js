const { Duplex, Writable, Readable } = require('stream')
const Bus = require('bus')

function read(length) {

}

function write() {}

function setup() {
  this._source = Serial1.setup({ tx: B7, rx: B6 })

  this._source.on('data', data => {
    console.log(data)
  })
}

//const _serial = Serial.setup({ tx: B7, rx: B6 })

const bus = new Bus({ read, write, setup })



alive()
