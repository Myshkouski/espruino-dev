'use strict';

var alive = null;
var defaultInterval = 200;

var blink = function blink(led) {
  var on = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultInterval;
  var off = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : on * 5;

  led.write(true);
  setTimeout(function () {
    led.write(false);
    if (alive) setTimeout(function () {
      return blink(led, on, off);
    }, off);
  }, on);
};

var start = function start() {
  if (!alive) {
    alive = true;
    blink(LED2);
  }
};

var stop = function stop() {
  if (alive) {
    alive = false;
  }
};

var alive$1 = (function (mode, onTimeout, offTimeout) {
  if (mode === undefined) mode = !alive;

  !mode ? stop() : start();

  return !!alive;
});

function arrayToBuffer(arr) {
	return new Uint8Array(arr);
}

function stringToUint8Array(str) {
	var arr = [];

	for (var c in str) {
		arr[c] = str.charCodeAt(c);
	}return new Uint8Array(arr);
}

function toBuffer(iterable) {
  if (typeof iterable === 'string') return stringToUint8Array(iterable);

  if (iterable instanceof Uint8Array || iterable instanceof Array) return arrayToBuffer(iterable);
}

function _createBuffer() {
	var iterable = toBuffer(arguments[0]);
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

	return buffer;
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

	list.forEach(function (buf) {
		buffer.set(buf, offset);
		offset += buf.length;
	});

	return buffer;
};

var defProp = function defProp(obj, prop, desc) {
  try {
    Object.defineProperty(obj, prop, desc);
    return obj;
  } catch (e) {
    if (desc.get) obj.value = desc.get();else if (desc.value) obj[prop] = desc.value;

    return obj;
  }
};

var SUPER_CHAIN_PROTO_PROP = 'super_';
var SUPER_CHAIN_APPLY_PROP = 'apply_';

var _extend = function _extend() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!options.apply) options.apply = [];
  if (!options.super) options.super = [];

  var Child = options.super[0];

  function Extended() {
    var _this = this,
        _arguments = arguments;

    options.apply.forEach(function (Super) {
      return Super.apply(_this, _arguments);
    });
  }

  defProp(Extended, 'name', { get: function get() {
      return Child.name;
    } });
  defProp(Extended, 'prototype', { value: {} });

  options.super.forEach(function (Super) {
    function Proto() {}
    Proto.prototype = Super.prototype;

    var proto = new Proto();

    for (var prop in proto) {
      if (prop !== SUPER_CHAIN_PROTO_PROP) defProp(Extended.prototype, prop, {
        value: proto[prop],
        enumerable: true,
        writable: true
      });
    }
  });

  defProp(Extended.prototype, 'constructor', { value: Child });
  defProp(Extended.prototype, SUPER_CHAIN_PROTO_PROP, { value: options.super });
  defProp(Extended.prototype, SUPER_CHAIN_APPLY_PROP, { value: options.apply });

  return Extended;
};

var extend = function extend() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return _extend({ super: args, apply: args });
};

var _setImmediate = global.setImmediate || function (f) {
  return setTimeout(f, 0);
};

var _process = global.process || {};

if (!_process.nextTick) _process.nextTick = _setImmediate;

function EventEmitter() {}

EventEmitter.prototype.on = function on() {
  Object.prototype.on.apply(this, arguments);

  return this;
};

function _Stream() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	this.options = {
		highWaterMark: options.highWaterMark || 128
	};
}

var Stream = _extend({
	super: [_Stream, EventEmitter],
	apply: [_Stream]
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

	_process.nextTick(function () {
		return _readFree.call(_this);
	});
}

function _end() {
	this._readableState.flowing = null;
	this._readableState.ended = true;
}

function _Readable() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	this._readableState = {
		buffer: Buffer.from([]),
		flowing: null,
		ended: false
	};

	this.pipes = [];

	this._read = options.read;
	if (!this._read) throw new TypeError('_read() is not implemented');
	if (!this._read instanceof Function) throw new TypeError('\'options.read\' should be a function, passed', _typeof(options.read));
}

var Readable = extend(_Readable, Stream);

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

	var data = Buffer.from(chunk);

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

			var _ref = _ref2;
			var listener = _ref.listener;

			this.removeListener(listener);
		}this.pipes.splice(0, this.pipes.length);
	}
};

Readable.prototype.on = function on(event, listener) {
	if (event === 'data') this.resume();

	return Stream.prototype.on.apply(this, arguments);
};

Readable.prototype.removeListener = function removeListener(event, listener) {
	if (event === 'data') this.pause();

	return Stream.prototype.removeListener.apply(this, arguments);
};

Readable.prototype.isPaused = function isPaused() {
	return !this._readableState.flowing;
};

function write$1(chunk /*, encoding*/) {
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
      _process.nextTick(function () {
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
}

function _Writable() {
  var _this = this;

  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
}

var Writable = extend(_Writable, Stream);

Writable.prototype.write = write$1;

function _Duplex() {
  
}

var Duplex = extend(_Duplex, Readable, Writable);

function _read(size) {}

function _write() {}

function _setup() {}

function _Bus() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!options.setup) options.setup = _setup.bind(this);

  Duplex.call(this, {
    read: _read,
    write: _write
  });

  this.options.frameTypes = [];
  this.options._frameState = {
    buffer: []
  };
}

var Bus = _extend({
  super: [Duplex],
  apply: [_Bus]
});

Bus.prototype.tx = function tx() {};

Bus.prototype.rx = function rx() {};

function read() {}
function write() {}

var bus = new Bus();
var readable = new Readable({ read: read });
var writable = new Writable({ write: write });
var duplex = new Duplex({ read: read, write: write });

alive$1();
//# sourceMappingURL=index.esp.rollup.js.map
