'use strict';

var loop = [
// nextTick
{ queue: [], immediatePush: true, tick: false },
// immediate
{ queue: [], immediatePush: true, tick: false },
// timeout
{ queue: [], immediatePush: false, tick: false }];

var tick = false;

var asyncFlush = function asyncFlush() {
  for (var stage in loop) {
    if (loop[stage].queue.length) {
      if (loop[stage].immediatePush) {
        for (var exec = 0; exec < loop[stage].queue.length; exec++) {
          loop[stage].queue[exec]();
        }
        loop[stage].queue.splice(0);
      } else {
        var queue = loop[stage].queue.splice(0);
        for (var _exec = 0; _exec < queue.length; _exec++) {
          queue[_exec]();
        }
      }
    }

    loop[stage].tick = tick = false;
  }
};

var asyncCall = function asyncCall(stage) {
  return function (cb) {
    loop[stage].queue.push(cb);

    if (!tick && !loop[stage].tick) {
      loop[stage].tick = tick = true;

      setTimeout(asyncFlush);
    }
  };
};

var nextTick = asyncCall( /* .nextTick */0);

var setImmediate = asyncCall( /* .immediate */1);

var timeoutCall = asyncCall( /* .timeeout */2);

var _setTimeout = function _setTimeout(cb, timeout) {
  // let index = 0
  // while(timers[index]) {
  //   index++
  // }
  // timers[index] = setTimeout(() => {
  //   if(timers[index]) {
  //     delete timers[index]
  //     timeoutCall(cb)
  //   }
  // }, timeout)
  //
  // return index

  return setTimeout(function () {
    timeoutCall(cb);
  }, timeout);
};

var _process = typeof process !== 'undefined' ? process : {};

_process.nextTick = typeof _process.nextTick !== 'undefined' ? _process.nextTick : nextTick;

var timers$1 = {};

function time(label) {
  timers$1[label] = Date.now();
}

function timeEnd(label) {
  if (label in timers$1) {
    console.log(label + ': ' + (Date.now() - timers$1[label]).toFixed(3) + 'ms');
    delete timers$1[label];
  }
}

if (typeof console.time !== 'function') {
  console.time = time;
  console.timeEnd = timeEnd;
}

if (typeof console.error !== 'function') {
  console.error = console.log;
}

Object.assign = function (target) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  for (var _iterator = args, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var obj = _ref;

    if (obj instanceof Object) for (var key in obj) {
      target[key] = obj[key];
    }
  }

  return target;
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
  //defProp(f, 'toString', { value: () => '[Function' + (f.name !== undefined ? ': ' + f.name : '') + ']' })

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
  if (!options.static) options.static = [];

  var Child = options.super[0];

  if (!options.name) options.name = Child.name;

  function Extended() {
    var _this = this,
        _arguments = arguments;

    Extended.prototype[SUPER_CHAIN_APPLY_PROP].forEach(function (Super) {
      if (Super !== Extended) {
        Super.apply(_this, _arguments);
      }
    });
  }

  _named(options.name, Extended);

  for (var i in options.static) {
    for (var prop in options.static[i]) {
      if ('prototype' != prop) {
        defProp(Extended, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        });
      }
    }
  }

  defProp(Extended, 'prototype', { value: {} });
  defProp(Extended.prototype, 'constructor', { value: Child });
  defProp(Extended.prototype, PROTOTYPE_IS_EXTENDED_PROP, { value: true });

  for (var _i in options.super) {
    var Proto = function Proto() {};

    Proto.prototype = options.super[_i].prototype;
    var _proto = new Proto();

    for (var _prop in _proto) {
      if (['constructor', PROTOTYPE_IS_EXTENDED_PROP, SUPER_CHAIN_PROTO_PROP, SUPER_CHAIN_APPLY_PROP].indexOf(_prop) < 0) {
        defProp(Extended.prototype, _prop, {
          value: _proto[_prop],
          enumerable: true,
          writable: true
        });
      }
    }
  }

  _copyChain(Extended, options.super, SUPER_CHAIN_PROTO_PROP, false);
  _copyChain(Extended, options.apply, SUPER_CHAIN_APPLY_PROP, true);

  return Extended;
};

Array.prototype.concat = function () {
  var concatenated = [];

  for (var i in this) {
    concatenated.push(this[i]);
  }

  for (var _i in arguments) {
    for (var j in arguments[_i]) {
      concatenated.push(arguments[_i][j]);
    }
  }

  return concatenated;
};

// var PENDING = 'pending'
// var SEALED = 'sealed'
// var FULFILLED = 'fulfilled'
// var REJECTED = 'rejected'
//
// var NOOP = function() {}
//
// function invokeResolver(resolver, promise) {
//   function resolvePromise(value) {
//     resolve(promise, value)
//   }
//
//   function rejectPromise(reason) {
//     reject(promise, reason)
//   }
//
//   try {
//     resolver(resolvePromise, rejectPromise)
//   } catch(e) {
//     rejectPromise(e)
//   }
// }
//
// function invokeCallback(subscriber) {
//   var owner = subscriber.owner
//   var settled = owner.state_
//   var value = owner.data_
//   var callback = subscriber[settled]
//   var promise = subscriber.then
//
//   if (typeof callback === 'function')
//   {
//     settled = FULFILLED
//     try {
//       value = callback(value)
//     } catch(e) {
//       reject(promise, e)
//     }
//   }
//
//   if (!handleThenable(promise, value))
//   {
//     if (settled === FULFILLED)
//       resolve(promise, value)
//
//     if (settled === REJECTED)
//       reject(promise, value)
//   }
// }
//
// function handleThenable(promise, value) {
//   var resolved
//
//   try {
//     if (promise === value)
//       throw new TypeError('A promises callback cannot return that same promise.')
//
//     if (value && (typeof value === 'function' || typeof value === 'object'))
//     {
//       var then = value.then  // then should be retrived only once
//
//       if (typeof then === 'function')
//       {
//         then.call(value, function(val){
//           if (!resolved)
//           {
//             resolved = true
//
//             if (value !== val)
//               resolve(promise, val)
//             else
//               fulfill(promise, val)
//           }
//         }, function(reason){
//           if (!resolved)
//           {
//             resolved = true
//
//             reject(promise, reason)
//           }
//         })
//
//         return true
//       }
//     }
//   } catch (e) {
//     if (!resolved)
//       reject(promise, e)
//
//     return true
//   }
//
//   return false
// }
//
// function resolve(promise, value){
//   if (promise === value || !handleThenable(promise, value))
//     fulfill(promise, value)
// }
//
// function publish(promise) {
//   var callbacks = promise.then_
//   promise.then_ = undefined
//
//   for (var i = 0 i < callbacks.length i++) {
//     invokeCallback(callbacks[i])
//   }
// }
//
// function fulfill(promise, value){
//   if (promise.state_ === PENDING)
//   {
//     promise.state_ = SEALED
//     promise.data_ = value
//
//     setImmediate(() => {
//       promise.state_ = FULFILLED
//       publish(promise)
//     })
//   }
// }
//
// function reject(promise, reason){
//   if (promise.state_ === PENDING)
//   {
//     promise.state_ = SEALED
//     promise.data_ = reason
//
//     setImmediate(() => {
//       promise.state_ = REJECTED
//       publish(promise)
//     })
//   }
// }
//
// function Promise(resolver) {
//   if (typeof resolver !== 'function')
//     throw new TypeError('Promise constructor takes a function argument')
//
//   if (this instanceof Promise === false)
//     throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.')
//
//   this.then_ = []
//
//   invokeResolver(resolver, this)
// }
//
// Promise.prototype = {
//   constructor: Promise,
//
//   state_: PENDING,
//   then_: null,
//   data_: undefined,
//
//   then: function(onFulfillment, onRejection){
//     var subscriber = {
//       owner: this,
//       then: new this.constructor(NOOP),
//       fulfilled: onFulfillment,
//       rejected: onRejection
//     }
//
//     if (this.state_ === FULFILLED || this.state_ === REJECTED)
//     {
//       // already resolved, call callback async
//       setImmediate(() => {invokeCallback(subscriber)})
//     }
//     else
//     {
//       // subscribe
//       this.then_.push(subscriber)
//     }
//
//     return subscriber.then
//   },
//
//   'catch': function(onRejection) {
//     return this.then(null, onRejection)
//   }
// }
//
// Promise.all = function(promises){
//   var Class = this
//
//   if (!(promises instanceof Array))
//     throw new TypeError('You must pass an array to Promise.all().')
//
//   return new Class((resolve, reject) => {
//     var results = []
//     var remaining = 0
//
//     function resolver(index){
//       remaining++
//       return function(value){
//         results[index] = value
//         if (!--remaining)
//           resolve(results)
//       }
//     }
//
//     for (var i = 0, promise i < promises.length i++)
//     {
//       promise = promises[i]
//
//       if (promise && typeof promise.then === 'function')
//         promise.then(resolver(i), reject)
//       else
//         results[i] = promise
//     }
//
//     if (!remaining)
//       resolve(results)
//   })
// }
//
// Promise.race = function(promises){
//   var Class = this
//
//   if (!(promises instanceof Array))
//     throw new TypeError('You must pass an array to Promise.race().')
//
//   return new Class((resolve, reject) => {
//     for (var i = 0, promise i < promises.length i++)
//     {
//       promise = promises[i]
//
//       if (promise && typeof promise.then === 'function')
//         promise.then(resolve, reject)
//       else
//         resolve(promise)
//     }
//   })
// }
//
// Promise.resolve = function(value) {
//   var Class = this
//
//   if (value && typeof value === 'object' && value.constructor === Class)
//     return value
//
//   return new Class(function(resolve){
//     resolve(value)
//   })
// }
//
// Promise.reject = function(reason){
//   var Class = this
//
//   return new Class(function(resolve, reject){
//     reject(reason)
//   })
// }
//
if (!Promise.race) {
  Promise.race = function (promises) {
    if (!(promises instanceof Array)) throw new TypeError('You must pass an array to Promise.race().');

    return new Promise(function (resolve, reject) {
      for (var i = 0, promise; i < promises.length; i++) {
        promise = promises[i];

        promise && typeof promise.then === 'function' ? promise.then(resolve, reject) : resolve(promise);
      }
    });
  };
}

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
var events = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
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

  if (isUndefined(handler))
    return false;

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
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
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
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

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
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
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
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

function _Stream() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	this.options = {
		highWaterMark: options.highWaterMark || 128
	};
}

var Stream = _extend({
	name: 'Stream',
	super: [events],
	apply: [events, _named('Stream', _Stream)]
});

Stream.prototype.emit = function (event, err) {
	if (event === 'error' && !(this['#onerror'] || this._events['error'])) throw new Error(err);

	return events.prototype.emit.apply(this, arguments);
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
	}, 0),
	    buffer = Buffer.from([], 0, totalLength);

	var offset = 0;

	list.forEach(function (buf) {
		buffer.set(buf, offset);
		offset += buf.length;
	});

	return buffer;
};

function BufferState() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Object.assign(this, {
    _buffer: [],
    length: 0
  }, options);
}

BufferState.prototype = {
  push: function push(chunk) {
    var node = {
      chunk: Buffer.from(chunk),
      next: null
    };

    if (this._buffer.length) {
      this._buffer[this._buffer.length - 1].next = node;
    }

    this._buffer.push(node);
    this.length += node.chunk.length;

    return this.length;
  },
  unshift: function unshift(chunk) {
    var node = {
      chunk: Buffer.from(chunk),
      encoding: 'binary',
      next: null
    };

    if (this._buffer.length) {
      node.next = this._buffer[0];
    }

    this._buffer.unshift(node);
    this.length += node.chunk.length;

    return this.length;
  },
  nodes: function nodes(count) {
    var _this = this;

    var nodes = this._buffer.splice(0, count);
    nodes.forEach(function (node) {
      return _this.length -= node.chunk.length;
    });

    return nodes;
  },
  at: function at(index) {
    if (index >= this.length || index < 0) {
      return;
    }

    for (var nodeIndex = 0; nodeIndex < this._buffer.length; nodeIndex++) {
      if (index < this._buffer[nodeIndex].chunk.length) {
        return {
          index: index,
          nodeIndex: nodeIndex
        };
      }

      index -= this._buffer[nodeIndex].chunk.length;
    }
  },
  buffer: function buffer(length) {
    if (length === undefined) {
      length = this.length;
    }

    if (!this.length) {
      return Buffer.from([]);
    }

    if (length > this.length) {
      length = this.length;
    }

    var to = void 0;

    if (length) {
      to = this.at(length);
    }

    if (!to) {
      to = {
        index: this.length - 1,
        nodeIndex: this._buffer.length - 1
      };
    }

    var buffer = Buffer.from([], 0, length);

    var offset = this.nodes(to.nodeIndex).reduce(function (offset, node) {
      buffer.set(node.chunk, offset);
      return offset += node.chunk.length;
    }, 0);

    if (offset < length) {
      var node = this.nodes(1).shift();

      buffer.set(node.chunk.slice(0, length - offset), offset);
      node.chunk = node.chunk.slice(length - offset);

      this.unshift(node);
    }

    return buffer;

    // return from.nodeIndex == to.nodeIndex
    //   ? this._buffer[from.nodeIndex].chunk.slice(from.index, to.index)
    //   : Buffer.concat([
    //       this._buffer[from.nodeIndex].chunk.slice(from.index),
    //       ...this._buffer.slice(1 + from.nodeIndex, to.nodeIndex).map(node => node.chunk),
    //       this._buffer[to.nodeIndex].chunk.slice(0, to.index)
    //     ])
  }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var encodings = {
	BINARY: 'binary',
	UTF8: 'utf8'
};

function toString(binary) {
	var str = '';
	for (var i = 0; i < binary.length; i++) {
		str += String.fromCharCode(binary[i]);
	}return str;
}

// function _broadcast() {
// 	let chunk = this.read()
// 	if(chunk && chunk.length) {
// 		process.nextTick(() => {
// 			if(this._readableState.defaultEncoding == encodings.UTF8) {
// 				chunk = toString(chunk)
// 			}
// 			this.emit('data', chunk, this._readableState.defaultEncoding)
// 		})
// 	}
// }

function _flow() {
	var _this = this;

	if (this._readableState.flowing) {
		// _broadcast.call(this)
		var chunk = this.read();
		if (chunk && chunk.length) {
			_process.nextTick(function () {
				if (_this._readableState.defaultEncoding == encodings.UTF8) {
					chunk = toString(chunk);
				}
				_this.emit('data', chunk, _this._readableState.defaultEncoding);
			});
		}
	}
}

function _end() {
	this._readableState.flowing = null;
	this._readableState.ended = true;
}

function _Readable() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	this._readableState = new BufferState({
		flowing: null,
		ended: false,
		defaultEncoding: encodings.BINARY
	});

	this.pipes = [];

	this._read = options.read.bind(this);

	if (!this._read) throw new TypeError('_read() is not implemented');
	if (!this._read instanceof Function) throw new TypeError('\'options.read\' should be a function, passed', _typeof(options.read));
}

_Readable.prototype = {
	pause: function pause() {
		//console.log('pause()')
		if (this._readableState.flowing !== false) {
			this._readableState.flowing = false;
			this.emit('pause');
		}

		return this;
	},
	resume: function resume() {
		if (!this._readableState.flowing) {
			this._readableState.flowing = true;
			this.emit('resume');
			_flow.call(this);
		}

		return this;
	},
	read: function read(length) {
		if (length < 0) {
			throw new Error('"length" must be more than 0');
		}

		if (!this._readableState.ended) {
			if (length === undefined) {
				if (this._readableState.length < this.options.highWaterMark) {
					this._read(this.options.highWaterMark - this._readableState.length);
				}
			} else if (length > this._readableState.length) {
				this._read(length - this._readableState.length);
			}
		}

		if (this._readableState.ended) {
			if (this._readableState.length) {
				return this._readableState.buffer();
			}

			return null;
		}

		if (length !== undefined && this._readableState.length < length) {
			return null;
		}

		return this._readableState.buffer(length);
	},
	push: function push(chunk) {
		//console.log('push(' + chunk + ')')
		if (chunk === null) {
			_end.call(this);
			return false;
		}

		var overflow = this._readableState.push(chunk) > this.options.highWaterMark;

		if (!overflow) _flow.call(this);

		return !overflow;
	},
	pipe: function pipe(writable) {
		var _this2 = this;

		if (!this.pipes.some(function (pipe) {
			pipe.writable === writable;
		})) {
			var listener = function listener(data, pipe) {
				if (!writable.write(data)) {
					pipe.stopped = true;
					_this2.pause();

					writable.once('drain', function () {
						_this2.resume();
					});
				}
			};

			var pipe = { writable: writable, listener: listener, stopped: undefined };

			this.on('data', function (data) {
				listener(data, pipe);
			}).pipes.push(pipe);

			if (writable instanceof Stream) writable.emit('pipe');
		}

		return writable;
	},
	unpipe: function unpipe(writable) {
		if (writable) {
			var pipe = this.pipes.find(function (pipe) {
				pipe.writable === writable;
			});

			if (pipe) this.removeListener('data', pipe.listener);
		} else {
			for (var index in this.pipes) {
				this.removeListener(this.pipes[index].listener);
			}this.pipes.splice(0);
		}
	},
	on: function on(event, listener) {
		if (event == 'data') this.resume();

		return Stream.prototype.on.apply(this, arguments);
	},
	removeListener: function removeListener(event, listener) {
		if (event == 'data') {
			//@TODO !!! this._listeners should be implemented
			//console.log(this.listeners)
			this.pause();
		}

		return Stream.prototype.removeListener.apply(this, arguments);
	},
	isPaused: function isPaused() {
		return !this._readableState.flowing;
	}
};

var Readable = _extend({
	name: 'Readable',
	super: [Stream, _Readable],
	apply: [Stream, _named('Readable', _Readable)]
});

function _readFromInternalBuffer() {
  var _writableState2;

  var spliced = (_writableState2 = this._writableState).nodes.apply(_writableState2, arguments);

  if (this._writableState.needDrain && this._writableState.length < this.options.highWaterMark) {
    this._writableState.needDrain = false;
    this.emit('drain');
  }

  return spliced;
}

function _flush() {
  var _this = this;

  var _writableState = this._writableState;


  if (_writableState.corked) return;

  if (!_writableState.length) {
    if (_writableState.ended) this.emit('finish');

    return;
  }

  var cb = function cb(err) {
    if (err) _this.emit('error', err);

    _writableState.consumed = true;

    _process.nextTick(function () {
      _flush.call(_this);
    });
  };

  if (!_writableState.corked && _writableState.consumed) {
    _writableState.consumed = false;

    if (this._writev) {
      var nodes = _readFromInternalBuffer.call(this);

      this._writev(nodes, cb);
    } else {
      var node = _readFromInternalBuffer.call(this, 1)[0];

      this._write(node.chunk, node.encoding, cb);
    }
  }
}

function _Writable() {
  var _this2 = this;

  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  this._write = options.write.bind(this);

  this._writableState = new BufferState({
    getBuffer: function getBuffer() {
      return _this2._writableState._buffer;
    },

    corked: 0,
    consumed: true,
    needDrain: false,
    ended: false,
    decodeStrings: true
  });
}

_Writable.prototype = {
  write: function write(chunk /*, encoding*/) {
    var _writableState = this._writableState;


    if (_writableState.ended) throw new Error('Write after end');

    this._writableState.push(chunk);

    _flush.call(this);

    return _writableState.length < this.options.highWaterMark;
  },
  end: function end() {
    this.write.apply(this, arguments);
    this._writableState.ended = true;
    return this;
  },
  cork: function cork() {
    this._writableState.corked++;
  },
  uncork: function uncork() {
    if (this._writableState.corked > 0) {
      this._writableState.corked--;
      _flush.call(this);
    }
  }
};

var Writable = _extend({
  name: 'Writable',
  super: [Stream, _Writable],
  apply: [Stream, _named('Writable', _Writable)]
});

function _Duplex() {
  
}

var Duplex = _extend({
  name: 'Duplex',
  super: [Readable, Writable],
  apply: [Readable, Writable, _named('Duplex', _Duplex)]
});

Duplex.prototype.on = function on() {
  Readable.prototype.on.apply(this, arguments);
  //Writable.prototype.on.apply(this, arguments)

  return this;
};

function _Duplex$1() {
  
}

var Duplex$2 = _extend({
  name: 'Duplex',
  super: [Readable, Writable],
  apply: [Readable, Writable, _named('Duplex', _Duplex$1)]
});

Duplex$2.prototype.on = function on() {
  Readable.prototype.on.apply(this, arguments);
  //Writable.prototype.on.apply(this, arguments)

  return this;
};

function _read(size) {
  //console.log('_read()')
  //dumb function
}

function _Transform() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Duplex$2.call(this, Object.assign({}, options, {
    read: _read,
    write: options.transform
  }));
}

var Transform = _extend({
  name: 'Transform',
  super: [Duplex$2],
  apply: [_named('Transform', _Transform)]
});

function _transform(data, encoding, cb) {
  this.push(data, encoding);
  cb();
}

function _PassThrough() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Transform.call(this, Object.assign({}, options, {
    transform: _transform
  }));
}

var PassThrough = _extend({
  name: 'PassThrough',
  super: [Transform],
  apply: [_PassThrough]
});

function _Schedule() {
  this.pending = Promise.resolve(null);
}

_Schedule.prototype = {
  immediate: function immediate(task) {
    var _this = this;

    this.pending = Promise.all([this.pending, new Promise(function (done, fail) {
      task(done, fail);
    }).catch(function (err) {
      return _this.emit('error', err);
    })]);

    return this;
  },
  deferred: function deferred(task) {
    var _this2 = this;

    this.pending = this.pending.then(function (r) {
      return new Promise(function (done, fail) {
        task(done, fail);
      });
    }).catch(function (err) {
      return _this2.emit('error', err);
    });

    return this;
  }
};

var Schedule = _extend({
  name: 'Schedule',
  super: [events, _named('Schedule', _Schedule)],
  apply: [events, _named('Schedule', _Schedule)]
});

function series(arr, cb, done) {
  var i = 0;(function next(res) {
    if (res !== undefined || i >= arr.length) {
      done && done(res);
    } else {
      setImmediate(function () {
        return cb(next, arr[i], i++, arr);
      });
    }
  })();
}

function _parse(chunk, encoding, cb) {
  var _busState = this._busState,
      incoming = _busState.incoming,
      watching = _busState.watching,
      frame = _busState.frame;


  var currentChunkIndex = 0,
      currentIncomingWatcherIndex = 0,
      incomingIndex = 0,
      isEqual = false;

  if (!watching.length) {
    this.emit('error', new Error({
      msg: 'Unexpected incoming data',
      data: chunk
    }));
  } else {
    for (; currentChunkIndex < chunk.length; currentChunkIndex++) {
      frame.push(chunk[currentChunkIndex]);

      if (!incoming.length) {
        for (var watchingIndex in watching) {
          try {
            incoming.push({
              patterns: watching[watchingIndex].patterns,
              callback: watching[watchingIndex].callback,
              currentPattern: watching[watchingIndex].patterns[0] instanceof Function ? watching[watchingIndex].patterns[0]([]) : watching[watchingIndex].patterns[0],
              arrayOffset: 0,
              patternIndex: 0,
              byteIndex: 0,
              length: 0
            });
          } catch (err) {
            this.emit('error', err);
          }
        }
      }

      for (incomingIndex = 0; incomingIndex < incoming.length;) {
        var incomingI = incoming[incomingIndex],
            expected = incomingI.currentPattern[incomingI.byteIndex];

        if (expected === undefined || expected === chunk[currentChunkIndex]) {
          isEqual = true;

          incomingI.byteIndex++;
        } else if (expected instanceof Array) {
          isEqual = true;

          if (incomingI.arrayOffset <= 0 && expected[0] > 0) {
            incomingI.arrayOffset = expected[0];
          }

          if (--incomingI.arrayOffset > 0) {
            continue;
          } else {
            incomingI.byteIndex++;
          }
        } else if (expected instanceof Function) {
          try {
            isEqual = !!expected.call(this, chunk[currentChunkIndex], incomingI.length, frame.slice(-incomingI.length - 1));
            incomingI.byteIndex++;
          } catch (err) {
            this.emit('error', err);
            isEqual = false;
          }
        } else {
          isEqual = false;
        }

        if (isEqual) {
          incomingI.length++;

          if (incomingI.byteIndex >= incomingI.currentPattern.length) {
            if (++incomingI.patternIndex >= incomingI.patterns.length) {
              try {
                incomingI.callback.call(this, frame.splice(-incomingI.length), incomingI.pattern);
              } catch (err) {
                this.emit('error', err);
              }

              incoming.splice(0);
              //break
            } else {
              var nextPattern = incomingI.patterns[incomingI.patternIndex];
              incomingI.byteIndex = 0;
              try {
                if (nextPattern instanceof Function) {
                  incomingI.currentPattern = nextPattern(frame.slice(-incomingI.length));
                } else {
                  incomingI.currentPattern = nextPattern;
                }
                incomingIndex++;
              } catch (err) {
                this.emit('error', err);
                incoming.splice(incomingIndex, 1);
              }
            }
          } else {
            incomingIndex++;
          }
        } else {
          incoming.splice(incomingIndex, 1);
        }
      }

      if (!incoming.length && frame.length) {
        this.emit('error', {
          msg: 'Unparsed chunk',
          data: frame.splice(0)
        });
        /*
        if(!isChunkCorrupted) {
          isChunkCorrupted = true
          setImmediate(() => {
            isChunkCorrupted = false
            this.emit('error', {
              msg: 'Unparsed chunk',
              data: frame.splice(0)
            })
          })
        }*/
      }
    }
  }

  cb();
}

function _write(chunk, encoding, cb) {
  var _this = this;

  var highWaterMark = this.options.highWaterMark;

  if (chunk.length > highWaterMark) {
    var chunks = [];
    var _loop = function _loop(bytesLeft, _offset) {
      var subchunk = chunk.slice(_offset, _offset += highWaterMark);
      chunks.push(function (next) {
        return _parse.call(_this, subchunk, encoding, next);
      });
      offset = _offset;
    };

    for (var bytesLeft = chunk.length, offset = 0; bytesLeft > 0; bytesLeft -= highWaterMark) {
      _loop(bytesLeft, offset);
    }

    series(chunks, cb);
  } else {
    _parse.apply(this, arguments);
  }
}

function _Bus() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Writable.call(this, Object.assign({}, options, {
    write: _write
  }));

  this._setup = options.setup.bind(this);

  this._busState = {
    watching: [],
    incoming: [],
    frame: [],
    configured: false
  };
}

_Bus.prototype = {
  setup: function setup() {
    var _this2 = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return this.deferred(function (slots) {
      if (_this2._busState.configured) return Promise.reject('already configured');

      _this2._busState.configured = true;
      return _this2._setup.apply(_this2, [slots].concat(args));
    });
  },
  watch: function watch(patterns, callback) {
    var watcher = {
      patterns: patterns,
      callback: callback
    };

    this._busState.watching.push(watcher);

    return watcher;
  },
  unwatch: function unwatch(watcher) {
    if (watcher) {
      var index = this._busState.watching.indexOf(watcher);

      if (index >= 0) this._busState.watching.splice(index, 1);
    } else {
      this._busState.watching.splice(0);
    }

    return this;
  },


  /**
    * @TODO - Proper unwatch(): delete all previously RXed watchers
    */
  rx: function rx(patterns, cb) {
    var _this3 = this;

    var watcher = this.watch(patterns, function (frame) {
      //this.unwatch(watcher)
      var index = _this3._busState.watching.indexOf(watcher);

      if (index >= 0) _this3._busState.watching.splice(0, index + 1);

      cb(frame);
    });

    return this;
  },
  tx: function tx(binary) {
    var _this4 = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return this.deferred(function () {
      console.log('tx');
      if ('timeout' in options) {
        return new Promise(function (done, fail) {
          _setTimeout(function () {
            _this4.write(binary);
            done();
          }, options.timeout);
        });
      }

      _this4.write(binary);

      return Promise.resolve();
    });
  },
  reset: function reset() {
    this._busState.frame.splice(0);
    this._busState.incoming.splice(0);
    return this;
  }
};

var Bus = _extend({
  name: 'Bus',
  super: [Writable, Schedule, _Bus],
  apply: [_Bus, Schedule]
});

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
      if (status) {
        _setTimeout(function () {
          return blink.once(LED2, 20, cb);
        }, 980);
      }
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
  _setTimeout(function () {
    led.write(false);
    cb && cb();
  }, on);
};

var data = { PN532_PREAMBLE: 0,
  PN532_STARTCODE1: 0,
  PN532_STARTCODE2: 255,
  PN532_POSTAMBLE: 0,
  PN532_HOST_TO_PN532: 212,
  PN532_PN532_TO_HOST: 213,
  PN532_COMMAND_DIAGNOSE: 0,
  PN532_COMMAND_GETFIRMWAREVERSION: 2,
  PN532_COMMAND_GETGENERALSTATUS: 4,
  PN532_COMMAND_READREGISTER: 6,
  PN532_COMMAND_WRITEREGISTER: 8,
  PN532_COMMAND_READGPIO: 12,
  PN532_COMMAND_WRITEGPIO: 14,
  PN532_COMMAND_SETSERIALBAUDRATE: 16,
  PN532_COMMAND_SETPARAMETERS: 18,
  PN532_COMMAND_SAMCONFIGURATION: 20,
  PN532_COMMAND_POWERDOWN: 22,
  PN532_COMMAND_RFCONFIGURATION: 50,
  PN532_COMMAND_RFREGULATIONTEST: 88,
  PN532_COMMAND_INJUMPFORDEP: 86,
  PN532_COMMAND_INJUMPFORPSL: 70,
  PN532_COMMAND_INLISTPASSIVETARGET: 74,
  PN532_COMMAND_INATR: 80,
  PN532_COMMAND_INPSL: 78,
  PN532_COMMAND_INDATAEXCHANGE: 64,
  PN532_COMMAND_INCOMMUNICATETHRU: 66,
  PN532_COMMAND_INDESELECT: 68,
  PN532_COMMAND_INRELEASE: 82,
  PN532_COMMAND_INSELECT: 84,
  PN532_COMMAND_INAUTOPOLL: 96,
  PN532_COMMAND_TGINITASTARGET: 140,
  PN532_COMMAND_TGSETGENERALBYTES: 146,
  PN532_COMMAND_TGGETDATA: 134,
  PN532_COMMAND_TGSETDATA: 142,
  PN532_COMMAND_TGSETMETADATA: 148,
  PN532_COMMAND_TGGETINITIATORCOMMAND: 136,
  PN532_COMMAND_TGRESPONSETOINITIATOR: 144,
  PN532_COMMAND_TGGETTARGETSTATUS: 138,
  PN532_WAKEUP: 85,
  PN532_SPI_STATREAD: 2,
  PN532_SPI_DATAWRITE: 1,
  PN532_SPI_DATAREAD: 3,
  PN532_SPI_READY: 1,
  PN532_I2C_ADDRESS: 36,
  PN532_I2C_READBIT: 1,
  PN532_I2C_BUSY: 0,
  PN532_I2C_READY: 1,
  PN532_I2C_READYTIMEOUT: 20,
  PN532_MIFARE_ISO14443A: 0,
  MIFARE_CMD_AUTH_A: 96,
  MIFARE_CMD_AUTH_B: 97,
  MIFARE_CMD_READ: 48,
  MIFARE_CMD_WRITE_4: 162,
  MIFARE_CMD_WRITE_16: 160,
  MIFARE_CMD_TRANSFER: 176,
  MIFARE_CMD_DECREMENT: 192,
  MIFARE_CMD_INCREMENT: 193,
  MIFARE_CMD_RESTORE: 194,
  NDEF_URIPREFIX_NONE: 0,
  NDEF_URIPREFIX_HTTP_WWWDOT: 1,
  NDEF_URIPREFIX_HTTPS_WWWDOT: 2,
  NDEF_URIPREFIX_HTTP: 3,
  NDEF_URIPREFIX_HTTPS: 4,
  NDEF_URIPREFIX_TEL: 5,
  NDEF_URIPREFIX_MAILTO: 6,
  NDEF_URIPREFIX_FTP_ANONAT: 7,
  NDEF_URIPREFIX_FTP_FTPDOT: 8,
  NDEF_URIPREFIX_FTPS: 9,
  NDEF_URIPREFIX_SFTP: 10,
  NDEF_URIPREFIX_SMB: 11,
  NDEF_URIPREFIX_NFS: 12,
  NDEF_URIPREFIX_FTP: 13,
  NDEF_URIPREFIX_DAV: 14,
  NDEF_URIPREFIX_NEWS: 15,
  NDEF_URIPREFIX_TELNET: 16,
  NDEF_URIPREFIX_IMAP: 17,
  NDEF_URIPREFIX_RTSP: 18,
  NDEF_URIPREFIX_URN: 19,
  NDEF_URIPREFIX_POP: 20,
  NDEF_URIPREFIX_SIP: 21,
  NDEF_URIPREFIX_SIPS: 22,
  NDEF_URIPREFIX_TFTP: 23,
  NDEF_URIPREFIX_BTSPP: 24,
  NDEF_URIPREFIX_BTL2CAP: 25,
  NDEF_URIPREFIX_BTGOEP: 26,
  NDEF_URIPREFIX_TCPOBEX: 27,
  NDEF_URIPREFIX_IRDAOBEX: 28,
  NDEF_URIPREFIX_FILE: 29,
  NDEF_URIPREFIX_URN_EPC_ID: 30,
  NDEF_URIPREFIX_URN_EPC_TAG: 31,
  NDEF_URIPREFIX_URN_EPC_PAT: 32,
  NDEF_URIPREFIX_URN_EPC_RAW: 33,
  NDEF_URIPREFIX_URN_EPC: 34,
  NDEF_URIPREFIX_URN_NFC: 35,
  PN532_GPIO_VALIDATIONBIT: 128,
  PN532_GPIO_P30: 0,
  PN532_GPIO_P31: 1,
  PN532_GPIO_P32: 2,
  PN532_GPIO_P33: 3,
  PN532_GPIO_P34: 4,
  PN532_GPIO_P35: 5,
  PN532_SAM_NORMAL_MODE: 1,
  PN532_SAM_VIRTUAL_CARD: 2,
  PN532_SAM_WIRED_CARD: 3,
  PN532_SAM_DUAL_CARD: 4,
  PN532_BRTY_ISO14443A: 0,
  PN532_BRTY_ISO14443B: 3,
  PN532_BRTY_212KBPS: 1,
  PN532_BRTY_424KBPS: 2,
  PN532_BRTY_JEWEL: 4,
  NFC_WAIT_TIME: 30,
  NFC_CMD_BUF_LEN: 64,
  NFC_FRAME_ID_INDEX: 6 };

var PN532_PREAMBLE = data.PN532_PREAMBLE;
var PN532_STARTCODE1 = data.PN532_STARTCODE1;
var PN532_STARTCODE2 = data.PN532_STARTCODE2;
var PN532_POSTAMBLE = data.PN532_POSTAMBLE;
var PN532_HOST_TO_PN532 = data.PN532_HOST_TO_PN532;
var PN532_PN532_TO_HOST = data.PN532_PN532_TO_HOST;









var PN532_COMMAND_SAMCONFIGURATION = data.PN532_COMMAND_SAMCONFIGURATION;





var PN532_COMMAND_INLISTPASSIVETARGET = data.PN532_COMMAND_INLISTPASSIVETARGET;


var PN532_COMMAND_INDATAEXCHANGE = data.PN532_COMMAND_INDATAEXCHANGE;













var PN532_WAKEUP = data.PN532_WAKEUP;










var MIFARE_CMD_AUTH_A = data.MIFARE_CMD_AUTH_A;

var MIFARE_CMD_READ = data.MIFARE_CMD_READ;
var MIFARE_CMD_WRITE_4 = data.MIFARE_CMD_WRITE_4;
















































var PN532_SAM_NORMAL_MODE = data.PN532_SAM_NORMAL_MODE;

var check = function check(values) {
  return 0x00 == 0xff & values.reduce(function (sum, value) {
    return sum += value;
  }, 0x00);
};

var LCS_std = function LCS_std(byte, length, frame) {
  return check(frame.slice(-2));
};

var CHECKSUM_std = function CHECKSUM_std(byte, length, frame) {
  return check(frame.slice(5));
};

var BODY_std = function BODY_std(frame) {
  var arr = [];
  for (var i = 0; i < frame[3] - 1; i++) {
    arr.push(undefined);
  }return arr;
};

var info = [[PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, undefined, LCS_std, PN532_PN532_TO_HOST], BODY_std, [CHECKSUM_std, PN532_POSTAMBLE]];



var err = [[PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x01, 0xff, undefined, CHECKSUM_std, PN532_POSTAMBLE]];

var ack = [new Uint8ClampedArray([PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x00, 0xff, PN532_POSTAMBLE])];



var command = function command(_command) {
  return new Uint8ClampedArray([PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0xff & _command.length + 1, 0xff & ~_command.length, PN532_HOST_TO_PN532].concat(_command, [
  // checksum
  ~(0xff & _command.reduce(function (checksum, byte) {
    return checksum += byte;
  }, 1 /** include PN532_HOST_TO_PN532 1 byte to length */)), PN532_POSTAMBLE]));
};

var data$2 = { TNF_EMPTY: 0,
  TNF_WELL_KNOWN: 1,
  TNF_MIME_MEDIA: 2,
  TNF_ABSOLUTE_URI: 3,
  TNF_EXTERNAL_TYPE: 4,
  TNF_UNKNOWN: 5,
  TNF_UNCHANGED: 6,
  TNF_RESERVED: 7,
  RTD_TEXT: "T",
  RTD_URI: "U",
  RTD_SMART_POSTER: "Sp",
  RTD_ALTERNATIVE_CARRIER: "ac",
  RTD_HANDOVER_CARRIER: "Hc",
  RTD_HANDOVER_REQUEST: "Hr",
  RTD_HANDOVER_SELECT: "Hs",
  BLOCK_SIZE: 16,
  TLV_START: 64,
  TL_LENGTH: 4 };

/**
  * decode text bytes from ndef record payload
  *
  * @returns a string
  */
var decode = function decode(data) {
    var languageCodeLength = data[0] & 0x3F,
        // 6 LSBs
    languageCode = data.slice(1, 1 + languageCodeLength); // assuming UTF-16BE

    // TODO need to deal with UTF in the future
    // console.log("lang " + languageCode + (utf16 ? " utf16" : " utf8"))

    return Buffer.from(data.slice(languageCodeLength + 1)).toString();
};

/**
  * Encode text payload
  *
  * @returns an array of bytes
  */
var encode = function encode(text, lang, encoding) {
    // ISO/IANA language code, but we're not enforcing
    if (!lang) {
        lang = 'en';
    }

    var encoded = Buffer.from([lang.length].concat([].slice.call(Buffer.from(lang + text))));

    return encoded;
};

// URI identifier codes from URI Record Type Definition NFCForum-TS-RTD_URI_1.0 2006-07-24
// index in array matches code in the spec
var protocols = ["", "http://www.", "https://www.", "http://", "https://", "tel:", "mailto:", "ftp://anonymous:anonymous@", "ftp://ftp.", "ftps://", "sftp://", "smb://", "nfs://", "ftp://", "dav://", "news:", "telnet://", "imap:", "rtsp://", "urn:", "pop:", "sip:", "sips:", "tftp:", "btspp://", "btl2cap://", "btgoep://", "tcpobex://", "irdaobex://", "file://", "urn:epc:id:", "urn:epc:tag:", "urn:epc:pat:", "urn:epc:raw:", "urn:epc:", "urn:nfc:"];

/**
  * @returns a string
  */
var decode$1 = function decode(data) {
    var prefix = protocols[data[0]];
    if (!prefix) {
        // 36 to 255 should be ""
        prefix = "";
    }
    return prefix + Buffer.from(data.slice(1)).toString();
};

/**
 * Creates a JSON representation of a NDEF Record.
 *
 * @tnf 3-bit TNF (Type Name Format) - use one of the constants.TNF_* constants
 * @type byte array, containing zero to 255 bytes, must not be null
 * @id byte array, containing zero to 255 bytes, must not be null
 * @payload byte array, containing zero to (2 ** 32 - 1) bytes, must not be null
 *
 * @returns JSON representation of a NDEF record
 *
 * @see Ndef.textRecord, Ndef.uriRecord and Ndef.mimeMediaRecord for examples
 */

var record = function record(tnf, type, id, payload, value) {
  if (!tnf) {
    tnf = data$2.TNF_EMPTY;
  }
  if (!type) {
    type = [];
  }
  if (!id) {
    id = [];
  }
  if (!payload) {
    payload = [];
  }
  // store type as String so it's easier to compare
  if (type instanceof Array) {
    type = Buffer.from(type).toString();
  }

  // in the future, id could be a String
  if (!(id instanceof Array)) {
    id = Buffer.from(id);
  }

  // Payload must be binary
  if (!(payload instanceof Array)) {
    payload = Buffer.from(payload);
  }

  // Experimental feature
  // Convert payload to text for Text and URI records
  if (tnf == data$2.TNF_WELL_KNOWN) {
    if (type == data$2.RTD_TEXT) {
      value = decode(payload);
    } else if (type == data$2.RTD_URI) {
      value = decode$1(payload);
    }
  }

  return {
    tnf: tnf,
    type: type,
    id: id,
    payload: payload,
    value: value
  };
};

/**
 * Helper that creates an NDEF record containing plain text.
 *
 * @text String of text to encode
 * @languageCode ISO/IANA language code. Examples: “fi”, “en-US”, “fr-CA”, “jp”. (optional)
 * @id byte[] (optional)
 */
var textRecord = function textRecord(text, languageCode, id) {
  return record(data$2.TNF_WELL_KNOWN, data$2.RTD_TEXT, id || [], encode(text, languageCode));
};

/**
* Encodes an NDEF Message into bytes that can be written to a NFC tag.
*
* @ndefRecords an Array of NDEF Records
*
* @returns byte array
*
* @see NFC Data Exchange Format (NDEF) http://www.nfc-forum.org/specs/spec_list/
*/
var encodeMessage = function encodeMessage(ndefRecords) {
  var encoded = [],
      tnf_byte = void 0,
      record_type = void 0,
      payload_length = void 0,
      id_length = void 0,
      i = void 0,
      mb = void 0,
      me = void 0,
      // messageBegin, messageEnd
  cf = false,
      // chunkFlag TODO implement
  sr = void 0,
      // boolean shortRecord
  il = void 0; // boolean idLengthFieldIsPresent

  for (i = 0; i < ndefRecords.length; i++) {
    mb = i === 0;
    me = i === ndefRecords.length - 1;
    sr = ndefRecords[i].payload.length < 0xFF;
    il = ndefRecords[i].id.length > 0;
    tnf_byte = encodeTnf(mb, me, cf, sr, il, ndefRecords[i].tnf);
    encoded.push(tnf_byte);

    // type is stored as String, converting to bytes for storage
    record_type = [].slice.call(Buffer.from(ndefRecords[i].type));
    encoded.push(record_type.length);

    if (sr) {
      payload_length = ndefRecords[i].payload.length;
      encoded.push(payload_length);
    } else {
      payload_length = ndefRecords[i].payload.length;
      // 4 bytes
      encoded.push(payload_length >> 24);
      encoded.push(payload_length >> 16);
      encoded.push(payload_length >> 8);
      encoded.push(payload_length & 0xFF);
    }

    if (il) {
      id_length = ndefRecords[i].id.length;
      encoded.push(id_length);
    }

    encoded = encoded.concat(record_type);

    if (il) {
      encoded = encoded.concat(ndefRecords[i].id);
    }

    encoded = encoded.concat([].slice.call(ndefRecords[i].payload));
  }

  return encoded;
};

/**
* Encode NDEF bit flags into a TNF Byte.
*
* @returns tnf byte
*
*  See NFC Data Exchange Format (NDEF) Specification Section 3.2 RecordLayout
*/
var encodeTnf = function encodeTnf(mb, me, cf, sr, il, tnf, value) {
  if (!value) {
    value = tnf;
  }

  if (mb) {
    value = value | 0x80;
  }

  if (me) {
    value = value | 0x40;
  }

  // note if cf: me, mb, li must be false and tnf must be 0x6
  if (cf) {
    value = value | 0x20;
  }

  if (sr) {
    value = value | 0x10;
  }

  if (il) {
    value = value | 0x8;
  }

  return value;
};

blink();

var encoded = encodeMessage([textRecord('2enhello world!')]);

var wakeup = command([PN532_WAKEUP]);
var sam = command([PN532_COMMAND_SAMCONFIGURATION, PN532_SAM_NORMAL_MODE, 20, 0]);

function setup(done) {
  var _this = this;

  Serial1.setup(115200, {
    rx: B7, tx: B6
  });

  Serial1.write(wakeup);
  Serial1.write(sam);

  _setTimeout(function () {
    Serial1.read();
    Serial1.pipe(_this);
  }, 1500);

  _setTimeout(function () {
    blink.once(LED1, 20, function () {
      return _setTimeout(function () {
        return blink.once(LED1, 20);
      }, 200);
    });

    done();
  }, 2000);
}

var bus = new Bus({
  setup: setup, highWaterMark: 64
});

bus.on('error', console.error);

bus.setup(Serial1);

var KEY = new Uint8ClampedArray([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

(function poll() {
  var uid = void 0,
      block = 4;

  bus.deferred(function (done) {
    var LIST = command([PN532_COMMAND_INLISTPASSIVETARGET, 1, 0]);

    bus.rx(ack, function () {
      console.log('ACK');
    });

    bus.rx(info, function (frame) {
      var body = frame.slice(7, 5 + frame[3]),
          uidLength = body[5],
          _uid = body.slice(6, 6 + uidLength);

      console.log('FOUND', {
        code: frame[6],
        body: body,
        count: body[0],
        ATQA: body.slice(2, 4), // SENS_RES
        SAK: body[4],
        uidLength: uidLength,
        uid: _uid
      }['ATQA']);

      uid = _uid;

      done();
    });

    Serial1.write(LIST);
  });

  bus.deferred(function (done, fail) {
    var AUTH = command([PN532_COMMAND_INDATAEXCHANGE, 1, MIFARE_CMD_AUTH_A, block].concat(KEY).concat(uid));

    bus.rx(ack, function (ack$$1) {});

    bus.rx(err, fail);

    bus.rx(info, function (frame) {
      console.log('AUTH SUCCEED' /*, {
                                 code: frame[6],
                                 body: frame.slice(7, 5 + frame[3])
                                 }*/);

      done();
    });

    Serial1.write(AUTH);
  });

  bus.deferred(function (done, fail) {
    var WRITE = command([PN532_COMMAND_INDATAEXCHANGE, 1, MIFARE_CMD_WRITE_4, block].concat(encoded));

    bus.rx(ack, function (ack$$1) {});

    bus.rx(err, fail);

    bus.rx(info, function (block) {
      console.log('WRITE SUCCEED');

      done();
    });

    Serial1.write(WRITE);
  });

  bus.deferred(function (done, fail) {
    var READ = command([PN532_COMMAND_INDATAEXCHANGE, 1, MIFARE_CMD_READ, block]);

    bus.rx(ack, function (ack$$1) {});

    bus.rx(err, fail);

    bus.rx(info, function (block) {
      console.log("RED", block);

      done();
    });

    Serial1.write(READ);
  });

  bus.deferred(function (done) {
    _setTimeout(function () {
      console.log(_process.memory().free);
      done();
      poll();
    }, 1000);
  });
})();
