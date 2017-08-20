/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
function _createBuffer(iterable) {
	var offset = arguments[1] !== undefined ? arguments[1] : 0,
	    length = arguments[2] !== undefined ? arguments[2] : iterable.length;

	var array = [];

	for (var i = offset; i--;) {
		array[i] = 0;
	}for (var _i = 0; _i < iterable.length && _i < length; _i++) {
		array[offset + _i] = iterable[_i];
	}for (var _i2 = array.length; _i2 < length; _i2++) {
		array[_i2] = 0;
	}var buffer = new Uint8Array(array);

	Object.defineProperties(buffer, {
		copy: { value: copy }
	});

	return buffer;
}

function copy(target) {
	var source = this,
	    targetStart = arguments[1] !== undefined ? arguments[1] : 0,
	    sourceStart = arguments[2] !== undefined ? arguments[2] : 0,
	    sourceEnd = arguments[3] !== undefined ? arguments[3] : source.length;

	var copied = 0;

	for (var sourceIndex = sourceStart, targetIndex = targetStart; sourceIndex < sourceEnd; sourceIndex++, targetIndex++, copied++) {
		target.set([source[sourceIndex]], targetIndex);
	}return copied;
}

function Buffer() {
	throw new Error('Buffer constructor is deprecated. Use Buffer.from() instead.');
}

Buffer.from = function from() {
	return _createBuffer.apply(null, arguments);
};

Buffer.concat = function concat() {
	var list = arguments[0] || [];
	var totalLength = arguments[1] !== undefined ? arguments[1] : list.reduce(function (totalLength, array) {
		return totalLength + array.length;
	}, 0);

	var buffer = _createBuffer([], 0, totalLength);
	var offset = 0;

	for (var _iterator = list, _isArray = Array.isArray(_iterator), _i3 = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
		var _ref;

		if (_isArray) {
			if (_i3 >= _iterator.length) break;
			_ref = _iterator[_i3++];
		} else {
			_i3 = _iterator.next();
			if (_i3.done) break;
			_ref = _i3.value;
		}

		var buf = _ref;

		buffer.set(buf, offset);
		offset += buf.length;
	}

	return buffer;
};

exports.default = Buffer;
module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.default = extend;
function extend(Super) {
   var Child = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function Child() {};
   var apply = arguments[2];

   var Proto = function Proto() {};
   Proto.prototype = Super.prototype;

   //Child.prototype = new Proto()
   //Child.prototype.constructor = Child

   function Extended() {
      apply === true && Super.apply(this, arguments);
      Child.apply(this, arguments);
   }

   Extended.prototype = new Proto();
   Object.defineProperty(Extended.prototype, 'constructor', {
      value: Child
   });

   return Extended;
}
module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
if (!global.process.nextTick) global.process.nextTick = global.setImmediate;

exports.default = global.process;
module.exports = exports["default"];

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(extend) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _events = __webpack_require__(4);

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Stream = extend(_events2.default, function Stream() {
	var options = arguments[0] || {};

	this.options = {
		highWaterMark: options.highWaterMark || 128
	};
}, true);

exports.default = Stream;
module.exports = exports['default'];
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function (n) {
  if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function (type) {
  var er, handler, len, args, i, listeners;

  if (!this._events) this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler)) return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++) {
      listeners[i].apply(this, args);
    }
  }

  return true;
};

EventEmitter.prototype.addListener = function (type, listener) {
  var m;

  if (!isFunction(listener)) throw TypeError('listener must be a function');

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function (type, listener) {
  if (!isFunction(listener)) throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function (type, listener) {
  var list, position, length, i;

  if (!isFunction(listener)) throw TypeError('listener must be a function');

  if (!this._events || !this._events[type]) return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener || isFunction(list.listener) && list.listener === listener) {
    delete this._events[type];
    if (this._events.removeListener) this.emit('removeListener', type, listener);
  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
        position = i;
        break;
      }
    }

    if (position < 0) return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener) this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function (type) {
  var key, listeners;

  if (!this._events) return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length) {
      this.removeListener(type, listeners[listeners.length - 1]);
    }
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function (type) {
  var ret;
  if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function (type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener)) return 1;else if (evlistener) return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function (emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _stream = __webpack_require__(6);

var CONSTANTS = {
  PN532_PREAMBLE: 0x00,
  PN532_STARTCODE1: 0x00,
  PN532_STARTCODE2: 0xFF,
  PN532_POSTAMBLE: 0x00,

  PN532_HOSTTOPN532: 0xD4,

  // PN532 Commands
  PN532_COMMAND_DIAGNOSE: 0x00,
  PN532_COMMAND_GETFIRMWAREVERSION: 0x02,
  PN532_COMMAND_GETGENERALSTATUS: 0x04,
  PN532_COMMAND_READREGISTER: 0x06,
  PN532_COMMAND_WRITEREGISTER: 0x08,
  PN532_COMMAND_READGPIO: 0x0C,
  PN532_COMMAND_WRITEGPIO: 0x0E,
  PN532_COMMAND_SETSERIALBAUDRATE: 0x10,
  PN532_COMMAND_SETPARAMETERS: 0x12,
  PN532_COMMAND_SAMCONFIGURATION: 0x14,
  PN532_COMMAND_POWERDOWN: 0x16,
  PN532_COMMAND_RFCONFIGURATION: 0x32,
  PN532_COMMAND_RFREGULATIONTEST: 0x58,
  PN532_COMMAND_INJUMPFORDEP: 0x56,
  PN532_COMMAND_INJUMPFORPSL: 0x46,
  PN532_COMMAND_INLISTPASSIVETARGET: 0x4A,
  PN532_COMMAND_INATR: 0x50,
  PN532_COMMAND_INPSL: 0x4E,
  PN532_COMMAND_INDATAEXCHANGE: 0x40,
  PN532_COMMAND_INCOMMUNICATETHRU: 0x42,
  PN532_COMMAND_INDESELECT: 0x44,
  PN532_COMMAND_INRELEASE: 0x52,
  PN532_COMMAND_INSELECT: 0x54,
  PN532_COMMAND_INAUTOPOLL: 0x60,
  PN532_COMMAND_TGINITASTARGET: 0x8C,
  PN532_COMMAND_TGSETGENERALBYTES: 0x92,
  PN532_COMMAND_TGGETDATA: 0x86,
  PN532_COMMAND_TGSETDATA: 0x8E,
  PN532_COMMAND_TGSETMETADATA: 0x94,
  PN532_COMMAND_TGGETINITIATORCOMMAND: 0x88,
  PN532_COMMAND_TGRESPONSETOINITIATOR: 0x90,
  PN532_COMMAND_TGGETTARGETSTATUS: 0x8A,

  PN532_WAKEUP: 0x55,

  /*PN532_SPI_STATREAD                  : 0x02,
  PN532_SPI_DATAWRITE                 : 0x01,
  PN532_SPI_DATAREAD                  : 0x03,
  PN532_SPI_READY                     : 0x01,*/

  PN532_I2C_ADDRESS: 0x48 >> 1,
  PN532_I2C_READBIT: 0x01,
  PN532_I2C_BUSY: 0x00,
  PN532_I2C_READY: 0x01,
  PN532_I2C_READYTIMEOUT: 20,

  /*PN532_MIFARE_ISO14443A              : 0x00,
   // Mifare Commands
  MIFARE_CMD_AUTH_A                   : 0x60,
  MIFARE_CMD_AUTH_B                   : 0x61,
  MIFARE_CMD_READ                     : 0x30,
  MIFARE_CMD_WRITE                    : 0xA0,
  MIFARE_CMD_TRANSFER                 : 0xB0,
  MIFARE_CMD_DECREMENT                : 0xC0,
  MIFARE_CMD_INCREMENT                : 0xC1,
  MIFARE_CMD_RESTORE                  : 0xC2,
   // Prefixes for NDEF Records : to identify record type,
  NDEF_URIPREFIX_NONE                 : 0x00,
  NDEF_URIPREFIX_HTTP_WWWDOT          : 0x01,
  NDEF_URIPREFIX_HTTPS_WWWDOT         : 0x02,
  NDEF_URIPREFIX_HTTP                 : 0x03,
  NDEF_URIPREFIX_HTTPS                : 0x04,
  NDEF_URIPREFIX_TEL                  : 0x05,
  NDEF_URIPREFIX_MAILTO               : 0x06,
  NDEF_URIPREFIX_FTP_ANONAT           : 0x07,
  NDEF_URIPREFIX_FTP_FTPDOT           : 0x08,
  NDEF_URIPREFIX_FTPS                 : 0x09,
  NDEF_URIPREFIX_SFTP                 : 0x0A,
  NDEF_URIPREFIX_SMB                  : 0x0B,
  NDEF_URIPREFIX_NFS                  : 0x0C,
  NDEF_URIPREFIX_FTP                  : 0x0D,
  NDEF_URIPREFIX_DAV                  : 0x0E,
  NDEF_URIPREFIX_NEWS                 : 0x0F,
  NDEF_URIPREFIX_TELNET               : 0x10,
  NDEF_URIPREFIX_IMAP                 : 0x11,
  NDEF_URIPREFIX_RTSP                 : 0x12,
  NDEF_URIPREFIX_URN                  : 0x13,
  NDEF_URIPREFIX_POP                  : 0x14,
  NDEF_URIPREFIX_SIP                  : 0x15,
  NDEF_URIPREFIX_SIPS                 : 0x16,
  NDEF_URIPREFIX_TFTP                 : 0x17,
  NDEF_URIPREFIX_BTSPP                : 0x18,
  NDEF_URIPREFIX_BTL2CAP              : 0x19,
  NDEF_URIPREFIX_BTGOEP               : 0x1A,
  NDEF_URIPREFIX_TCPOBEX              : 0x1B,
  NDEF_URIPREFIX_IRDAOBEX             : 0x1C,
  NDEF_URIPREFIX_FILE                 : 0x1D,
  NDEF_URIPREFIX_URN_EPC_ID           : 0x1E,
  NDEF_URIPREFIX_URN_EPC_TAG          : 0x1F,
  NDEF_URIPREFIX_URN_EPC_PAT          : 0x20,
  NDEF_URIPREFIX_URN_EPC_RAW          : 0x21,
  NDEF_URIPREFIX_URN_EPC              : 0x22,
  NDEF_URIPREFIX_URN_NFC              : 0x23,
   PN532_GPIO_VALIDATIONBIT            : 0x80,
  PN532_GPIO_P30                      : 0,
  PN532_GPIO_P31                      : 1,
  PN532_GPIO_P32                      : 2,
  PN532_GPIO_P33                      : 3,
  PN532_GPIO_P34                      : 4,
  PN532_GPIO_P35                      : 5,*/

  PN532_SAM_NORMAL_MODE: 0x01,
  PN532_SAM_VIRTUAL_CARD: 0x02,
  PN532_SAM_WIRED_CARD: 0x03,
  PN532_SAM_DUAL_CARD: 0x04,

  PN532_BRTY_ISO14443A: 0x00,
  PN532_BRTY_ISO14443B: 0x03,
  PN532_BRTY_212KBPS: 0x01,
  PN532_BRTY_424KBPS: 0x02,
  PN532_BRTY_JEWEL: 0x04,
  NFC_WAIT_TIME: 30,
  NFC_CMD_BUF_LEN: 64,
  NFC_FRAME_ID_INDEX: 6
};

var cmd = function cmd(c, readBytes) {
  var i,
      arr = [CONSTANTS.PN532_PREAMBLE, CONSTANTS.PN532_STARTCODE1, CONSTANTS.PN532_STARTCODE2, c.length + 1, ~c.length & 0xFF, CONSTANTS.PN532_HOSTTOPN532];
  for (i in c) {
    arr.push(c[i]);
  }var checksum = -arr[0];
  for (i in arr) {
    checksum += arr[i];
  }arr.push(~checksum & 0xFF);
  checksum = 0;
  for (i in arr) {
    checksum += arr[i];
  }arr.push(CONSTANTS.PN532_POSTAMBLE);
  return new Uint8Array(arr);
};

var toBinaryArray = function toBinaryArray() {
  var totalLength = 0;
  for (var _iterator = arrays, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var arr = _ref;

    totalLength += arr.length;
  }
  var result = new resultConstructor(totalLength);
  var offset = 0;
  for (var _iterator2 = arrays, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref2;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref2 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref2 = _i2.value;
    }

    var _arr = _ref2;

    result.set(_arr, offset);
    offset += _arr.length;
  }
  return result;
};

/*
I2C1.setup({scl:B6, sda:B7});
I2C1.writeTo(C.PN532_I2C_ADDRESS, cmd([C.PN532_COMMAND_GETFIRMWAREVERSION], 12));
console.log(I2C1.readFrom(C.PN532_I2C_ADDRESS, 6));
*/

/*
const bus = Serial.find(B7);

bus.setup(115200, {
  rx: B7, tx: B6
});

const wakeup = new Uint8Array([0x55, 0x55, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const c = cmd([CONSTANTS.PN532_COMMAND_GETFIRMWAREVERSION]);
*/

var readable = new _stream.Readable({
  read: function read() {
    this.push('1');
    this.push('2');
    this.push(null);
  }
});

var writable = new _stream.Writable({
  write: function write(data, encoding, cb) {
    console.log('!', data, encoding);
    cb();
  }
});

var ui8a = new Uint8Array([]);
readable.pipe(writable);

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Writable = exports.Readable = undefined;

var _readable = __webpack_require__(7);

var _readable2 = _interopRequireDefault(_readable);

var _writable = __webpack_require__(11);

var _writable2 = _interopRequireDefault(_writable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Readable = _readable2.default;
exports.Writable = _writable2.default;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer, process, extend) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _stream = __webpack_require__(3);

var _stream2 = _interopRequireDefault(_stream);

var _events = __webpack_require__(4);

var _events2 = _interopRequireDefault(_events);

var _to = __webpack_require__(8);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _readFree() {
	return this._read(this._readableState.highWaterMark - this._readableState.buffer.length);
}

function _readFromInternalBuffer(length) {
	var data = this._readableState.buffer.slice(0, length !== undefined ? length : this.options.highWaterMark);
	this._readableState.buffer = Buffer.from([]);

	return data;
}

function _broadcast() {
	if (this._readableState.buffer.length > 0) this.emit('data', _readFromInternalBuffer.call(this));
}

function _flow() {
	var _this = this;

	if (this._readableState.flowing === true) _broadcast.call(this);

	process.nextTick(function () {
		return _readFree.call(_this);
	});
}

function _end() {
	this._readableState.flowing = null;
	this._readableState.ended = true;
}

var Readable = extend(_stream2.default, function Readable() {
	var options = arguments[0] || {};

	this._readableState = {
		buffer: Buffer.from([]),
		flowing: null,
		ended: false
	};

	this.pipes = [];

	this._read = options.read;
	if (!this._read) throw new TypeError('_read() is not implemented');
	if (!this._read instanceof Function) throw new TypeError('\'options.read\' should be a function, passed', _typeof(options.read));
}, true);

Readable.prototype.pause = function pause() {
	if (this._readableState.flowing !== false) {
		this._readableState.flowing = false;
		this.emit('pause');
	}

	return this;
};

Readable.prototype.resume = function resume() {
	if (!this._readableState.flowing) {
		this._readableState.flowing = true;
		this.emit('resume');
		_flow.call(this);
	}

	_broadcast.call(this);

	return this;
};

Readable.prototype.read = function read() {
	var length = arguments[0] !== undefined ? arguments[0] : this.options.highWaterMark;
	return _readFromInternalBuffer.call(this, length);
};

Readable.prototype.push = function push(chunk) {
	if (chunk === null) {
		_end.call(this);
		return false;
	}

	var data = Buffer.from((0, _to.toBuffer)(chunk));

	if (data.length) this._readableState.buffer = Buffer.concat([this._readableState.buffer, data], this._readableState.buffer.length + data.length);

	var overflow = this._readableState.buffer.length > this.options.highWaterMark;

	if (!overflow) _flow.call(this);

	return !overflow;
};

Readable.prototype.pipe = function pipe(writable) {
	if (!this.pipes.find(function (pipe) {
		return pipe.writable === writable;
	})) {
		var listener = function listener(data) {
			return writable.write(data);
		};

		this.on('data', listener).pipes.push({ writable: writable, listener: listener });
	}

	return writable;
};

Readable.prototype.unpipe = function unpipe(writable) {
	if (writable) {
		var pipe = this.pipes.find(function (pipe) {
			return pipe.writable === writable;
		});

		if (pipe) this.removeListener('data', pipe.listener);
	} else {
		for (var _iterator = this.pipes, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
			var _ref2;

			if (_isArray) {
				if (_i >= _iterator.length) break;
				_ref2 = _iterator[_i++];
			} else {
				_i = _iterator.next();
				if (_i.done) break;
				_ref2 = _i.value;
			}

			var _ref3 = _ref2;
			var listener = _ref3.listener;

			this.removeListener(listener);
		}this.pipes.splice(0, this.pipes.length);
	}
};

Readable.prototype.on = function on(event, listener) {
	if (event === 'data') this.resume();

	return _stream2.default.prototype.on.apply(this, arguments);
};

Readable.prototype.removeListener = function removeListener(event, listener) {
	if (event === 'data') this.pause();

	return _stream2.default.prototype.removeListener.apply(this, arguments);
};

Readable.prototype.isPaused = function isPaused() {
	return !this._readableState.flowing;
};

exports.default = Readable;
module.exports = exports['default'];
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0), __webpack_require__(2), __webpack_require__(1)))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stringToBuffer = exports.arrayToBuffer = exports.toBuffer = undefined;

var _arrayToBuffer = __webpack_require__(9);

var _arrayToBuffer2 = _interopRequireDefault(_arrayToBuffer);

var _stringToBuffer = __webpack_require__(10);

var _stringToBuffer2 = _interopRequireDefault(_stringToBuffer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toBuffer(iterable) {
  if (iterable instanceof Buffer || iterable instanceof Array) return (0, _arrayToBuffer2.default)(iterable);

  if (typeof iterable === 'string') return (0, _stringToBuffer2.default)(iterable);
}

exports.toBuffer = toBuffer;
exports.arrayToBuffer = _arrayToBuffer2.default;
exports.stringToBuffer = _stringToBuffer2.default;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = arrayToUint8Array;
function arrayToUint8Array(arr) {
	return new Uint8Array(arr);
}
module.exports = exports["default"];

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = stringToUint8Array;
function stringToUint8Array(str) {
	var arr = [];

	for (var c in str) {
		arr[c] = str[c].charCodeAt();
	}return new Uint8Array(arr);
}
module.exports = exports["default"];

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(extend, Buffer) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stream = __webpack_require__(3);

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Writable = extend(_stream2.default, function Writable() {
  var _this = this;

  var options = arguments[0] || {};
  this._write = options.write;

  this._writableState = {
    buffer: Buffer.from([]),
    getBuffer: function getBuffer() {
      return _this._writableState.buffer;
    },

    corked: false,
    consumed: true
  };
}, true);

Writable.prototype.write = function write(chunk) {
  var self = this;
  var buffer = Buffer.from(chunk);
  self._writableState.buffer = Buffer.concat([self._writableState.buffer, buffer], self._writableState.buffer.length + buffer.length);

  function writeInternalBuffer() {
    var length = self._writableState.buffer.length > self.options.highWaterMark ? self.options.highWaterMark : self._writableState.buffer.length;

    var buffer = self._writableState.buffer;
    self._writableState.buffer = Buffer.from([]);

    function cb(err) {
      if (err) throw err;

      self._writableState.consumed = true;

      if (self._writableState.buffer.length > 0) writeInternalBuffer();
    }

    if (!self._writableState.corked && self._writableState.consumed) {
      self._writableState.consumed = false;
      self._write(buffer, 'binary', cb);
    }
  }

  writeInternalBuffer();

  return self;
};

exports.default = Writable;
module.exports = exports['default'];
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(0)))

/***/ })
/******/ ]);
//# sourceMappingURL=index.esp.js.map