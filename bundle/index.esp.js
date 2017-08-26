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
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process, setImmediate) {

exports.__esModule = true;
if (!process.nextTick) {
  process.nextTick = setImmediate;
}

exports.default = process;
module.exports = exports["default"];
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0), __webpack_require__(9)))

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
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


exports.__esModule = true;

var _to = __webpack_require__(5);

function _createBuffer() {
	var iterable = (0, _to.toBuffer)(arguments[0]);
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

	/*Object.defineProperties(buffer, {
 	copy: {	value: copy }
 })*/

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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var on = Object.prototype.on;

Object.prototype.on = function () {
	on.apply(this, arguments);

	return this;
};

module.exports = Object;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer, process, extend) {

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _stream = __webpack_require__(6);

var _stream2 = _interopRequireDefault(_stream);

var _events = __webpack_require__(3);

var _events2 = _interopRequireDefault(_events);

var _to = __webpack_require__(5);

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
	if (!this.pipes.some(function (pipe) {
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), __webpack_require__(0), __webpack_require__(1)))

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

exports.__esModule = true;
exports.stringToBuffer = exports.arrayToBuffer = exports.toBuffer = undefined;

var _arrayToBuffer = __webpack_require__(11);

var _arrayToBuffer2 = _interopRequireDefault(_arrayToBuffer);

var _stringToBuffer = __webpack_require__(12);

var _stringToBuffer2 = _interopRequireDefault(_stringToBuffer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toBuffer(iterable) {
  if (typeof iterable === 'string') return (0, _stringToBuffer2.default)(iterable);

  if (iterable instanceof Buffer || iterable instanceof Array) return (0, _arrayToBuffer2.default)(iterable);
}

exports.toBuffer = toBuffer;
exports.arrayToBuffer = _arrayToBuffer2.default;
exports.stringToBuffer = _stringToBuffer2.default;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(extend) {

exports.__esModule = true;

var _events = __webpack_require__(3);

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
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(extend, Buffer, process) {

exports.__esModule = true;

var _stream = __webpack_require__(6);

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Writable = extend(_stream2.default, function Writable() {
  var _this = this;

  var options = arguments[0] || {};
  this._write = options.write;

  this._writableState = {
    buffer: [],
    length: 0,
    getBuffer: function getBuffer() {
      return _this._writableState.buffer;
    },

    corked: false,
    consumed: true
  };
}, true);

Writable.prototype.write = function write(chunk /*, encoding*/) {
  var self = this;

  var data = {
    chunk: Buffer.from(chunk),
    encoding: 'binary',
    next: null

    // = Buffer.concat([self._writableState.buffer, buffer], self._writableState.buffer.length + buffer.length)

  };var state = self._writableState;
  var buffer = state.buffer;

  buffer.push(data);
  buffer[buffer.length - 1].next = data;
  state.length += data.chunk.length;

  function _writeInternalBuffer() {
    if (!buffer.length) return;

    function cb(err) {
      process.nextTick(function () {
        if (err) throw err;

        state.consumed = true;

        if (buffer.length > 0) _writeInternalBuffer();
      });
    }

    if (!state.corked && state.consumed) {
      state.consumed = false;

      var toConsume = void 0;

      if (self._writev && buffer.length > 1) {
        toConsume = buffer.map(function (d) {
          return { chunk: d.chunk, encoding: d.encoding };
        });
        buffer.splice(0, buffer.length);
        state.length = 0;
        self._writev(toConsume, cb);
      } else {
        toConsume = buffer.shift();
        state.length -= toConsume.chunk.length;
        self._write(toConsume.chunk, toConsume.encoding, cb);
      }
    }
  }

  _writeInternalBuffer();

  return state.length > self.options.highWaterMark;
};

exports.default = Writable;
module.exports = exports['default'];
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(2), __webpack_require__(0)))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _stream = __webpack_require__(10);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (global.setImmediate) module.exports = global.setImmediate;else module.exports = function (f) {
  return setInterval(f, 0);
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.Duplex = exports.Writable = exports.Readable = undefined;

var _readable = __webpack_require__(4);

var _readable2 = _interopRequireDefault(_readable);

var _writable = __webpack_require__(7);

var _writable2 = _interopRequireDefault(_writable);

var _duplex = __webpack_require__(13);

var _duplex2 = _interopRequireDefault(_duplex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Readable = _readable2.default;
exports.Writable = _writable2.default;
exports.Duplex = _duplex2.default;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.default = arrayToUint8Array;
function arrayToUint8Array(arr) {
	return new Uint8Array(arr);
}
module.exports = exports["default"];

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.default = stringToUint8Array;
function stringToUint8Array(str) {
	var arr = [];

	for (var c in str) {
		arr[c] = str.charCodeAt(c);
	}return new Uint8Array(arr);
}
module.exports = exports["default"];

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(extend) {

exports.__esModule = true;

var _readable = __webpack_require__(4);

var _readable2 = _interopRequireDefault(_readable);

var _writable = __webpack_require__(7);

var _writable2 = _interopRequireDefault(_writable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Duplex = extend(_readable2.default, extend(_writable2.default, function Duplex() {}, true), true);

exports.default = Duplex;
module.exports = exports['default'];
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ })
/******/ ]);
//# sourceMappingURL=index.esp.js.map