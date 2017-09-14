'use strict';

function pushImmediate(queue) {
  for (var i = 0; i < queue.length; i++) {
    queue[i]();
  }queue.splice(0);
}

function pushToNextIteration(_queue) {
  var queue = [].concat(_queue);
  _queue.splice(0);
  for (var i = 0; i < queue.length; i++) {
    queue[i]();
  }
}

var loop = {
  nextTick: { queue: [], handle: pushImmediate, timer: false },
  timeout: { queue: [], handle: pushToNextIteration, timer: false },
  immediate: { queue: [], handle: pushImmediate, timer: false }
};

var timer = false;

function asyncCall(cb) {
  setTimeout(cb);
}

function asyncFlush() {
  for (var i in loop) {
    loop[i].handle(loop[i].queue);
    loop[i].timer = timer = false;
  }
}

function defer(stage, cb) {
  stage.queue.push(cb);

  if (!timer && !stage.timer) {
    stage.timer = timer = true;
    asyncCall(asyncFlush);
  }
}

var _setTimeout$1 = function _setTimeout(cb, timeout) {
  defer(loop.timeout, function () {
    return setTimeout(cb, timeout);
  });
};

var status = false;
function blink(mode) {
  if (mode === undefined) mode = !status;

  !mode ? blink.stop() : blink.start();

  return !!status;
}

blink.start = function () {
  if (!status) {
    status = true;

    blink.once(LED2, 20, function cb() {
      if (status) _setTimeout$1(function () {
        return blink.once(LED2, 20, cb);
      }, 980);
    });
  }
};

blink.stop = function () {
  if (status) {
    status = false;
  }
};

blink.once = function (led) {
  var on = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
  var cb = arguments[2];

  led.write(true);
  _setTimeout$1(function () {
    led.write(false);
    cb && cb();
  }, on);
};

var _nextTick = function nextTick(cb) {
  defer(loop.nextTick, cb);
}.bind(undefined);

var _process = typeof process !== 'undefined' ? process : {};

_process.nextTick = typeof _process.nextTick !== 'undefined' ? _process.nextTick : _nextTick;

var _setImmediate$1 = function (cb) {
  defer(loop.immediate, cb);
}.bind(undefined);

var babelHelpers = {};
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();



















































babelHelpers;

var PENDING = 'pending';
var SEALED = 'sealed';
var FULFILLED = 'fulfilled';
var REJECTED = 'rejected';

var NOOP = function NOOP() {};

function invokeResolver(resolver, promise) {
  function resolvePromise(value) {
    resolve(promise, value);
  }

  function rejectPromise(reason) {
    reject(promise, reason);
  }

  try {
    resolver(resolvePromise, rejectPromise);
  } catch (e) {
    rejectPromise(e);
  }
}

function invokeCallback(subscriber) {
  var owner = subscriber.owner;
  var settled = owner.state_;
  var value = owner.data_;
  var callback = subscriber[settled];
  var promise = subscriber.then;

  if (typeof callback === 'function') {
    settled = FULFILLED;
    try {
      value = callback(value);
    } catch (e) {
      reject(promise, e);
    }
  }

  if (!handleThenable(promise, value)) {
    if (settled === FULFILLED) resolve(promise, value);

    if (settled === REJECTED) reject(promise, value);
  }
}

function handleThenable(promise, value) {
  var resolved;

  try {
    if (promise === value) throw new TypeError('A promises callback cannot return that same promise.');

    if (value && (typeof value === 'function' || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object')) {
      var then = value.then; // then should be retrived only once

      if (typeof then === 'function') {
        then.call(value, function (val) {
          if (!resolved) {
            resolved = true;

            if (value !== val) resolve(promise, val);else fulfill(promise, val);
          }
        }, function (reason) {
          if (!resolved) {
            resolved = true;

            reject(promise, reason);
          }
        });

        return true;
      }
    }
  } catch (e) {
    if (!resolved) reject(promise, e);

    return true;
  }

  return false;
}

function resolve(promise, value) {
  if (promise === value || !handleThenable(promise, value)) fulfill(promise, value);
}

function fulfill(promise, value) {
  if (promise.state_ === PENDING) {
    promise.state_ = SEALED;
    promise.data_ = value;

    _setImmediate$1(function () {
      return publishFulfillment(promise);
    });
  }
}

function reject(promise, reason) {
  if (promise.state_ === PENDING) {
    promise.state_ = SEALED;
    promise.data_ = reason;

    _setImmediate$1(function () {
      return publishRejection(promise);
    });
  }
}

function publish(promise) {
  var callbacks = promise.then_;
  promise.then_ = undefined;

  for (var i = 0; i < callbacks.length; i++) {
    invokeCallback(callbacks[i]);
  }
}

function publishFulfillment(promise) {
  promise.state_ = FULFILLED;
  publish(promise);
}

function publishRejection(promise) {
  promise.state_ = REJECTED;
  publish(promise);
}

function Promise$1(resolver) {
  if (typeof resolver !== 'function') throw new TypeError('Promise constructor takes a function argument');

  if (this instanceof Promise$1 === false) throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');

  this.then_ = [];

  invokeResolver(resolver, this);
}

Promise$1.prototype = {
  constructor: Promise$1,

  state_: PENDING,
  then_: null,
  data_: undefined,

  then: function then(onFulfillment, onRejection) {
    var subscriber = {
      owner: this,
      then: new this.constructor(NOOP),
      fulfilled: onFulfillment,
      rejected: onRejection
    };

    if (this.state_ === FULFILLED || this.state_ === REJECTED) {
      // already resolved, call callback async
      _setImmediate$1(function () {
        return invokeCallback(subscriber);
      });
    } else {
      // subscribe
      this.then_.push(subscriber);
    }

    return subscriber.then;
  },

  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

Promise$1.all = function (promises) {
  var Class = this;

  if (!(promises instanceof Array)) throw new TypeError('You must pass an array to Promise.all().');

  return new Class(function (resolve, reject) {
    var results = [];
    var remaining = 0;

    function resolver(index) {
      remaining++;
      return function (value) {
        results[index] = value;
        if (! --remaining) resolve(results);
      };
    }

    for (var i = 0, promise; i < promises.length; i++) {
      promise = promises[i];

      if (promise && typeof promise.then === 'function') promise.then(resolver(i), reject);else results[i] = promise;
    }

    if (!remaining) resolve(results);
  });
};

Promise$1.race = function (promises) {
  var Class = this;

  if (!(promises instanceof Array)) throw new TypeError('You must pass an array to Promise.race().');

  return new Class(function (resolve, reject) {
    for (var i = 0, promise; i < promises.length; i++) {
      promise = promises[i];

      if (promise && typeof promise.then === 'function') promise.then(resolve, reject);else resolve(promise);
    }
  });
};

Promise$1.resolve = function (value) {
  var Class = this;

  if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.constructor === Class) return value;

  return new Class(function (resolve) {
    resolve(value);
  });
};

Promise$1.reject = function (reason) {
  var Class = this;

  return new Class(function (resolve, reject) {
    reject(reason);
  });
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

var _named = (function (name, f) {
  defProp(f, 'name', { value: name });
  defProp(f, 'toString', { value: function value() {
      return '[Function' + (f.name !== undefined ? ': ' + f.name : '') + ']';
    } });

  return f;
});

var SUPER_CHAIN_PROTO_PROP = '_super';
var SUPER_CHAIN_APPLY_PROP = '_apply';
var PROTOTYPE_IS_EXTENDED_PROP = '_isExtended';

var _copyChain = function _copyChain(Extended, ProtoChain, chainPropName, ignoreExtended) {
  //if chain on [Extended] has not been created yet
  if (!Extended.prototype[chainPropName]) defProp(Extended.prototype, chainPropName, { value: [] });

  ProtoChain.forEach(function (Proto) {
    //console.log(!!Proto.prototype['__extended__'], Proto)
    //if [Proto] has been '__extended__' and has same-named proto chain, copy the Proto chain to Extended chain
    var isExtended = !!Proto.prototype[PROTOTYPE_IS_EXTENDED_PROP],
        hasSameChain = !!Proto.prototype[chainPropName];

    var alreadyInChain = Extended.prototype[chainPropName].some(function (P) {
      return P === Proto;
    }),
        shouldBePushed = (!isExtended || !ignoreExtended) && !alreadyInChain,
        shouldCopyChain = isExtended && hasSameChain;

    if (shouldCopyChain) Proto.prototype[chainPropName].forEach(function (Proto) {
      //avoid pushing twice
      if (!Extended.prototype[chainPropName].some(function (P) {
        return P === Proto;
      })) {
        //console.log('pushed', Proto)
        Extended.prototype[chainPropName].push(Proto);
      }
    });

    if (shouldBePushed) Extended.prototype[chainPropName].push(Proto);
  });

  //console.log(Extended.prototype[chainPropName])
};

var _extend = function _extend() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!options.apply) options.apply = [];
  if (!options.super) options.super = [];

  var Child = options.super[0];

  if (!options.name) options.name = Child.name;

  function Extended() {
    var _this = this,
        _arguments = arguments;

    Extended.prototype[SUPER_CHAIN_APPLY_PROP].forEach(function (Super) {
      if (Super !== Extended) Super.apply(_this, _arguments);
    });
  }

  _named(options.name, Extended);

  defProp(Extended, 'prototype', { value: {} });
  defProp(Extended.prototype, 'constructor', { value: Child });
  defProp(Extended.prototype, PROTOTYPE_IS_EXTENDED_PROP, { value: true });

  options.super.forEach(function (Super) {
    function Proto() {}
    Proto.prototype = Super.prototype;

    var proto = new Proto();

    for (var prop in proto) {
      if (['constructor', PROTOTYPE_IS_EXTENDED_PROP, SUPER_CHAIN_PROTO_PROP, SUPER_CHAIN_APPLY_PROP].indexOf(prop) < 0) defProp(Extended.prototype, prop, {
        value: proto[prop],
        enumerable: true,
        writable: true
      });
    }
  });

  _copyChain(Extended, options.super, SUPER_CHAIN_PROTO_PROP, false);
  _copyChain(Extended, options.apply, SUPER_CHAIN_APPLY_PROP, true);

  return Extended;
};

function Buffer() {
	throw new Error('Buffer constructor is deprecated. Use Buffer.from() instead.');
}

Buffer.from = function _createBuffer() {
	//console.log(arguments)
	var iterable = [];
	if (typeof arguments[0] === 'string') {
		for (var c in arguments[0]) {
			iterable[c] = arguments[0].charCodeAt(c);
		}iterable = new Uint8Array(iterable);
	} else if (arguments[0] instanceof Uint8Array || arguments[0] instanceof Array) iterable = new Uint8Array(arguments[0]);

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
};

Buffer.concat = function concat() {
	var list = arguments[0] || [],
	    totalLength = arguments[1] !== undefined ? arguments[1] : list.reduce(function (totalLength, array) {
		return totalLength + array.length;
	}, 0);

	var buffer = Buffer.from([], 0, totalLength),
	    offset = 0;

	list.forEach(function (buf) {
		buffer.set(buf, offset);
		offset += buf.length;
	});

	return buffer;
};

function EventEmitter() {}

_named('EventEmitter', EventEmitter);

EventEmitter.prototype.on = function on() {
  Object.prototype.on.apply(this, arguments);

  return this;
};

EventEmitter.prototype.once = function once(event, listener) {
  function _listener() {
    this.removeListener(event, _listener);
    return listener.apply(this, arguments);
  }

  return this.on(event, _listener);
};

function _Stream() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	this.options = {
		highWaterMark: options.highWaterMark || 128
	};
}

_named('Stream', _Stream);

var Stream = _extend({
	name: 'Stream',
	super: [EventEmitter],
	apply: [EventEmitter, _Stream]
});

var ENCODINGS = {
	BINARY: 'binary',
	UTF8: 'utf8'
};

function _readFree() {
	//console.log('_readFree()')
	return this._read(this._readableState.highWaterMark - this._readableState.length);
}

function _readFromInternalBuffer() {
	var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.options.highWaterMark;

	var buffer = [];

	if (this._readableState.length > 0 && length > 0) {
		var red = 0;
		while (this._readableState.length > 0 && red < length) {
			var data = this._readableState.buffer[0];
			if (red + data.chunk.length <= length) {
				this._readableState.buffer.shift();
				this._readableState.length -= data.chunk.length;
				red += length;
				buffer.push(data);
			} else break;
		}
	}

	return buffer;
}

function _broadcast() {
	var _this = this;

	//console.log('_broadcast()')
	var buffer = _readFromInternalBuffer.call(this);
	if (buffer.length > 0) {
		_process.nextTick(function () {
			//console.log('buffer', buffer)
			buffer.forEach(function (data) {
				_this.emit('data', data.chunk, data.encoding);
			});
		});
	}
}

function _flow() {
	var _this2 = this;

	//console.log('_flow()', this._readableState.flowing)
	if (this._readableState.flowing) {
		_broadcast.call(this);
		_process.nextTick(function () {
			return _readFree.call(_this2);
		});
	}
}

function _end() {
	this._readableState.flowing = null;
	this._readableState.ended = true;
}

function _Readable() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	this._readableState = {
		buffer: [], //Buffer.from([]),
		length: 0,
		flowing: null,
		ended: false,
		defaultEncoding: ENCODINGS.UTF8
	};

	this.pipes = [];

	this._read = options.read.bind(this);

	if (!this._read) throw new TypeError('_read() is not implemented');
	if (!this._read instanceof Function) throw new TypeError('\'options.read\' should be a function, passed', _typeof(options.read));
}
_named('Readable', _Readable);

var Readable = _extend({
	name: 'Readable',
	super: [Stream],
	apply: [Stream, _Readable]
});

Readable.prototype.pause = function pause() {
	//console.log('pause()')
	if (this._readableState.flowing !== false) {
		this._readableState.flowing = false;
		this.emit('pause');
	}

	return this;
};

Readable.prototype.resume = function resume() {
	//console.log('resume()')
	if (!this._readableState.flowing) {
		this._readableState.flowing = true;
		this.emit('resume');
		_flow.call(this);
	}

	//_broadcast.call(this)

	return this;
};

Readable.prototype.read = function read() {
	var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.options.highWaterMark;

	return _readFromInternalBuffer.call(this, length);
};

Readable.prototype.push = function push(chunk) {
	//console.log('push(' + chunk + ')')
	if (chunk === null) {
		_end.call(this);
		return false;
	}

	var data = {
		chunk: Buffer.from(chunk),
		next: null
	};

	if (this._readableState.buffer.length) this._readableState.buffer[this._readableState.buffer.length - 1].next = data;
	this._readableState.buffer.push(data);
	this._readableState.length += data.chunk.length;

	var overflow = this._readableState.length > this.options.highWaterMark;

	if (!overflow) _flow.call(this);

	return !overflow;
};

Readable.prototype.pipe = function pipe(writable) {
	var _this3 = this;

	if (!this.pipes.some(function (pipe) {
		return pipe.writable === writable;
	})) {
		var listener = function listener(data, pipe) {
			if (!writable.write(data)) {
				//console.log('pipe should be stopped!')
				pipe.stopped = true;
				_this3.pause();

				writable.once('drain', function () {
					return _this3.resume();
				});
			}
		};

		var _pipe = { writable: writable, listener: listener, stopped: undefined };

		this.on('data', function (data) {
			return listener(data, _pipe);
		}).pipes.push(_pipe);
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
	if (event === 'data') {
		//!!! this._listeners should be implemented
		//console.log(this.listeners)
		this.pause();
	}

	return Stream.prototype.removeListener.apply(this, arguments);
};

Readable.prototype.isPaused = function isPaused() {
	return !this._readableState.flowing;
};

function _readFromInternalBuffer$1() {
  var _writableState$buffer;

  var spliced = (_writableState$buffer = this._writableState.buffer).splice.apply(_writableState$buffer, arguments);
  this._writableState.length -= spliced.reduce(function (length, data) {
    return length += data.chunk.length;
  }, 0);

  if (this._writableState.needDrain && this._writableState.length < this.options.highWaterMark) {
    this._writableState.needDrain = false;
    this.emit('drain');
  }

  return spliced;
}

function _writeToInternalBuffer(chunk, encoding) {
  var data = {
    chunk: Buffer.from(chunk),
    encoding: 'binary',
    next: null
  };

  if (this._writableState.buffer.length) this._writableState.buffer[this._writableState.buffer.length - 1].next = data;
  this._writableState.buffer.push(data);
  this._writableState.length += data.chunk.length;

  return this._writableState.buffer;
}

function write(chunk /*, encoding*/) {
  //console.log('write(' + chunk + ')')
  _writeToInternalBuffer.apply(this, arguments);(function _consume() {
    var _this = this;

    if (!this._writableState.buffer.length) return;

    var cb = function cb(err) {
      if (err) throw err;

      _process.nextTick(function () {
        _this._writableState.consumed = true;

        if (_this._writableState.buffer.length > 0) _consume();
      });
    };

    if (!this._writableState.corked && this._writableState.consumed) {
      this._writableState.consumed = false;

      if (this._writev && this._writableState.buffer.length > 1) {
        var toConsume = _readFromInternalBuffer$1.call(this, 0, this._writableState.buffer.length).map(function (d) {
          return { chunk: d.chunk, encoding: d.encoding };
        });

        this._writev(toConsume, cb);
      } else {
        var _toConsume = _readFromInternalBuffer$1.call(this, 0, 1).shift();

        this._write(_toConsume.chunk, _toConsume.encoding, cb);
      }
    }
  }).call(this);

  return this._writableState.length < this.options.highWaterMark;
}

function _Writable() {
  var _this2 = this;

  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  this._write = options.write.bind(this);

  this._writableState = {
    buffer: [],
    length: 0,
    getBuffer: function getBuffer() {
      return _this2._writableState.buffer;
    },

    corked: 0,
    consumed: true,
    needDrain: false,
    defaultEncoding: 'utf8',
    decodeStrings: true
  };
}

_named('Writable', _Writable);

var Writable = _extend({
  name: 'Writable',
  super: [Stream],
  apply: [Stream, _Writable]
});

Writable.prototype.write = write;

function _Duplex() {
  
}
_named('Duplex', _Duplex);

var Duplex = _extend({
  name: 'Duplex',
  super: [Readable, Writable],
  apply: [Readable, Writable, _Duplex]
});

Duplex.prototype.on = function on() {
  Readable.prototype.on.apply(this, arguments);
  //Writable.prototype.on.apply(this, arguments)

  return this;
};

function _Duplex$1() {
  
}
_named('Duplex', _Duplex$1);

var Duplex$2 = _extend({
  name: 'Duplex',
  super: [Readable, Writable],
  apply: [Readable, Writable, _Duplex$1]
});

Duplex$2.prototype.on = function on() {
  Readable.prototype.on.apply(this, arguments);
  //Writable.prototype.on.apply(this, arguments)

  return this;
};

function _read$1(size) {
  //console.log('_read()')
  //dumb function
}

function _write$1(data, encoding, cb) {
  //console.log('_write(' + data + ')')
  return this._transform(data, encoding, cb);
}

function _Transform() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Duplex$2.call(this, {
    read: _read$1,
    write: _write$1,
    highWaterMark: options.highWaterMark
  });

  this._transform = options.transform.bind(this);
}

var Transform = _extend({
  name: 'Transform',
  super: [Duplex$2],
  apply: [_Transform]
});

function _transform(data, encoding, cb) {
  this.push(data, encoding);
  cb();
}

function _PassThrough() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Transform.call(this, {
    highWaterMark: options.highWaterMark,
    transform: _transform
  });
}

var PassThrough = _extend({
  super: [Transform],
  apply: [_PassThrough]
});

function _Schedule() {
  this._edge = Promise$1.resolve();
  this.slots = {};
}

var Schedule = _extend({
  name: 'Schedule',
  super: [EventEmitter],
  apply: [EventEmitter, _Schedule]
});

Schedule.prototype.immediate = function (task) {
  var _this = this;

  this._edge = Promise$1.all([this._edge, Promise$1.resolve(task(this.slots)).catch(function (err) {
    return _this.emit('error', err);
  })]);

  return this;
};

Schedule.prototype.deferred = function (task) {
  var _this2 = this;

  this._edge = this._edge.then(function (r) {
    return task(_this2.slots);
  }).catch(function (err) {
    return _this2.emit('error', err);
  });

  return this;
};

function _read(size) {}

function _write(data, encoding, cb) {
  this.slots.incoming.emit('data', { chunk: data, encoding: encoding });

  cb();
}

function _Bus() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Duplex.call(this, {
    read: _read,
    write: _write,
    highWaterMark: options.highWaterMark
  });

  this._setup = options.setup.bind(this);

  this.slots.incoming = new EventEmitter();

  this._busState = {
    configured: false,
    parsing: Buffer.from([])
    //parsedFrames: []
  };
}

var Bus = _extend({
  name: 'Bus',
  super: [Duplex, Schedule],
  apply: [Schedule, _Bus]
});

Bus.prototype.setup = function () {
  var _this = this;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return this.deferred(function (slots) {
    if (_this._busState.configured) return Promise$1.reject('already configured');

    _this._busState.configured = true;
    return _this._setup.apply(_this, [slots].concat(args));
  });
};

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
  PN532_SPI_READY                     : 0x01,
    PN532_I2C_ADDRESS                   : 0x48 >> 1,
  PN532_I2C_READBIT                   : 0x01,
  PN532_I2C_BUSY                      : 0x00,
  PN532_I2C_READY                     : 0x01,
  PN532_I2C_READYTIMEOUT              : 20,
    PN532_MIFARE_ISO14443A              : 0x00,
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

var wakeup = new Uint8Array([0x55, 0x55, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
var c = cmd([CONSTANTS.PN532_COMMAND_GETGENERALSTATUS]);
var sam = cmd([CONSTANTS.PN532_COMMAND_SAMCONFIGURATION, CONSTANTS.PN532_SAM_NORMAL_MODE, 20, 0]);

//blink()

function setup(slots, serial) {
  console.log('setup()');

  slots.serial = serial;

  serial.setup(115200, {
    rx: B7, tx: B6
  });

  serial.pipe(this);

  serial.write(wakeup);
  serial.write(sam);

  return new Promise$1(function (resolve) {
    _setTimeout$1(function () {
      blink.once(LED1, 20, function () {
        return _setTimeout$1(function () {
          return blink.once(LED1, 20);
        }, 200);
      });

      console.log('configured');

      resolve();
    }, 2000);
  });
}

var bus = new Bus({ setup: setup });

bus.on('frame', function (frame) {
  return console.log(_process.memory().free, frame);
});

bus.on('error', function (err) {
  return console.log(err);
});

bus.setup(Serial1);

bus.deferred(function (_ref) {
  var serial = _ref.serial;
  return setInterval(function () {
    return serial.write(c);
  }, 2000);
});

bus.deferred(function (slots) {
  slots.incoming.on('data', function (data) {
    blink.once(LED2);
    //console.log('incoming', data.chunk)
  });
});
//# sourceMappingURL=index.esp.rollup.js.map
