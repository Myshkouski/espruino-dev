// create a NDEF message containing a URI

var ndef = require('../index'),
    message,
    byteArray,
    buffer;

message = [ ndef.uriRecord("http://nodejs.org") ];
console.log(message);

byteArray = ndef.encodeMessage(message);
buffer = new Buffer(byteArray);

console.log(buffer.toString('base64'));
