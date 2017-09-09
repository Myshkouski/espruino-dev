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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("stream");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _stream = __webpack_require__(0);

var _bus = __webpack_require__(2);

var _bus2 = _interopRequireDefault(_bus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function read(length) {}

function write() {}

function setup() {
  var _this = this;

  setInterval(function () {
    _this.write('0100\r1');
    setTimeout(function () {
      _this.write('00os\r\n0sj');
    }, 500);
  }, 1000);
}

//const _serial = Serial.setup({ tx: B7, rx: B6 })

var bus = new _bus2.default({ setup: setup });

bus.frameSet.push({
  decode: function decode(chunk) {
    for (var index = 0; index < chunk.length; index++) {
      if (chunk[index] === '\r'.charCodeAt() && chunk[index + 1] === '\n'.charCodeAt()) {
        var frame = this._busState.parsing.slice(0, index + 2);
        this._busState.parsing = Buffer.from(this._busState.parsing.slice(frame.length + 2, this._busState.parsing.length));
        return frame;
      }
    }

    throw new Error('Not a frame');
  }
});

bus.setup();

bus.on('frame', function (frame) {
  return console.log('frame', frame);
});

//alive()

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _stream = __webpack_require__(0);

function _read(size) {}

function _write(data, encoding, cb) {
  var _this = this;

  var binary = Buffer.from(data);
  this._busState.parsing = Buffer.concat([this._busState.parsing, binary], this._busState.parsing.length + binary.length);

  //optimize

  this.frameSet.some(function (frameSet) {
    var frame = void 0;

    try {
      frame = frameSet.decode.call(_this, _this._busState.parsing);
    } catch (err) {
      return false;
    }

    //this.options._busState.parsedFrames.push(frame)

    _this.emit('frame', frame);

    return true;
  });

  cb();
}

function _Bus() {
  var _this2 = this;

  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _stream.Duplex.call(this, {
    read: _read,
    write: _write,
    highWaterMark: options.highWaterMark
  });

  defProp(this, 'setup', {
    value: function value() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (!_this2._busState.set) {
        //console.log(options.setup)
        options.setup.apply(_this2, args);
      } else throw new Error('Bus has been already set up.');

      return _this2;
    }
  });

  this.frameSet = [];
  /*this.options.optimize = {
    handlers: [],
    }*/
  this._busState = {
    set: false,
    parsing: Buffer.from([])
    //parsedFrames: []
  };
}

var Bus = _extend({
  super: [_stream.Duplex],
  apply: [_Bus]
});

Bus.prototype.tx = function tx(binary, cb) {};

Bus.prototype.rx = function rx() {};

exports.default = Bus;
module.exports = exports['default'];

/***/ })
/******/ ]);
//# sourceMappingURL=index.node.webpack.js.map