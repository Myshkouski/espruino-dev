'use strict';

var alive = null;

var start = function start() {
  var on = true;
  if (!alive) alive = setInterval(function () {
    LED2.write(on);
    on = !on;
  }, 500);
};

var stop = function stop() {
  if (alive) {
    clearInterval(alive);
    alive = null;
  }
};

var alive$1 = (function (mode) {
  if (mode === undefined) mode = !alive;

  !mode ? stop() : start();

  return !!alive;
});

var _superChain = function _superChain(obj, Proto, _checked) {
  if (obj && obj.super_ instanceof Array) {
    return obj.super_.some(function (Super) {
      if (Super === Proto) return true;
      if (_checked.some(function (Class) {
        return Class === Super;
      })) return false;

      _checked.push(Super);

      return _superChain(obj.super_, Super, _checked);
    });
  }
};

var instanceOf = (function (instance, Proto) {
  return instance instanceof Proto || !!_superChain(instance, Proto, []);
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

  if (instanceOf(iterable, Uint8Array) || instanceOf(iterable, Array)) return arrayToBuffer(iterable);
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

function extend() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	var Child = args[0];

	function Extended() {
		for (var _iterator = Extended.super_, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
			var _ref;

			if (_isArray) {
				if (_i >= _iterator.length) break;
				_ref = _iterator[_i++];
			} else {
				_i = _iterator.next();
				if (_i.done) break;
				_ref = _i.value;
			}

			var Super = _ref;

			Super.apply(this, arguments);
		}this.super_ = Extended.super_;
	}

	Extended.super_ = args;
	Extended.prototype = {};

	for (var _iterator2 = args, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
		var Proto = function Proto() {};

		var _ref2;

		if (_isArray2) {
			if (_i2 >= _iterator2.length) break;
			_ref2 = _iterator2[_i2++];
		} else {
			_i2 = _iterator2.next();
			if (_i2.done) break;
			_ref2 = _i2.value;
		}

		var Super = _ref2;

		Proto.prototype = Super.prototype;

		var p = new Proto();
		for (var prop in p) {
			Extended.prototype[prop] = p[prop];
		} //Object.assign(Extended.prototype, new Proto())
	}

	Object.defineProperty(Extended.prototype, 'constructor', {
		value: Child
	});

	return Extended;
}

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var setImmediate_1 = createCommonjsModule(function (module) {
  if (commonjsGlobal.setImmediate) module.exports = setImmediate;else module.exports = function (f) {
    return setTimeout(f, 0);
  };
});

if (!process.nextTick) {
  process.nextTick = setImmediate_1;
}

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

var Stream = extend(_Stream, EventEmitter);

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
	if (!instanceOf(this._read, Function)) throw new TypeError('\'options.read\' should be a function, passed', typeof options.read);
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

function write(chunk /*, encoding*/) {
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

Writable.prototype.write = write;

function _Duplex() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
}

var Duplex = extend(_Duplex, Readable, Writable);

var d = new Duplex({
  read: function read() {},
  write: function write(d, e, cb) {
    this.push(d);
    cb();
  }
});

console.log(!!d.read, !!d.write);
console.log(instanceOf(d, Writable));

d.write('!');
d.read(10);

alive$1();
//# sourceMappingURL=index.esp.rollup.js.map
