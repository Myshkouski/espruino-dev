'use strict';

if (typeof console.time !== 'function') {
  var timers = {};

  console.time = function (label) {
    timers[label] = Date.now();
  };

  console.timeEnd = function (label) {
    if (label in timers) {
      console.log(label + ': ' + (Date.now() - timers[label]).toFixed(3) + 'ms');
      delete timers[label];
    }
  };
}

if (typeof console.error !== 'function') {
  console.error = console.log;
}

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

// Promise.all = function(promises) {
//   if (!(promises instanceof Array)) {
//     throw new TypeError('You must pass an array to Promise.all().')
//   }
//
//   return new Promise((resolve, reject) => {
//     var results = []
//     var remaining = 0
//
//     function resolver(index) {
//       remaining++
//       return function(value) {
//         results[index] = value
//         if (!--remaining) {
//           resolve(results)
//         }
//       }
//     }
//
//     for (var i = 0, promise; i < promises.length; i++) {
//       promise = promises[i]
//
//       if (promise && typeof promise.then === 'function') {
//         promise.then(resolver(i), reject)
//       }
//       else {
//         results[i] = promise
//       }
//     }
//
//     if (!remaining) {
//       resolve(results)
//     }
//   })
// }

Promise.race = function (promises) {
  var Class = this;

  if (!(promises instanceof Array)) throw new TypeError('You must pass an array to Promise.race().');

  return new Class(function (resolve, reject) {
    for (var i = 0, promise; i < promises.length; i++) {
      promise = promises[i];

      if (promise && typeof promise.then === 'function') promise.then(resolve, reject);else resolve(promise);
    }
  });
};

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

ArrayBuffer.isView = function (value) {
  return (typeof value === 'undefined' ? 'undefined' : _typeof$1(value)) === 'object' && value.buffer instanceof ArrayBuffer;
}; // arrayBufferViewInstances.some( ArrayBufferView => value instanceof ArrayBufferView )

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// import Uint8Array from './Uint8Array'
// import { toBuffer } from './utils/to'

// function copy(target) {
// 	const targetStart 	= arguments[1] !== undefined ? arguments[1] : 0,
// 				sourceStart 	= arguments[2] !== undefined ? arguments[2] : 0,
// 				sourceEnd 		= arguments[3] !== undefined ? arguments[3] : source.length
//
// 	let copied = 0
//
// 	for(let sourceIndex = sourceStart, targetIndex = targetStart; sourceIndex < sourceEnd; sourceIndex++, targetIndex++, copied++)
// 		target.set([ this[sourceIndex] ], targetIndex)
//
// 	return copied
// }

var Proto = Uint8Array;

function Buffer() {
  throw new Error('Buffer proto is deprecated. Use Buffer.from() instead.');
}

Buffer.isBuffer = function (value) {
  return value instanceof Proto;
};

Buffer.from = function from(iterable, offset, length) {
  if (typeof iterable == 'string') {
    var parsed = [];

    for (var c in iterable) {
      parsed[c] = iterable.charCodeAt(c);
    }

    return new Proto(parsed);
  } else if (Array.isArray(iterable) || this.isBuffer(iterable)) {
    return new Proto(iterable);
  } else if (iterable instanceof ArrayBuffer) {
    offset = offset !== undefined ? offset : 0;
    length = length !== undefined ? length : iterable.byteLength;
    return new Proto(iterable.slice(offset, offset + length));
  } else {
    throw new TypeError('Cannot create buffer from', typeof iterable === 'undefined' ? 'undefined' : _typeof(iterable));
  }
};

Buffer.concat = function concat(_list, _totalLength) {
  var list = _list || [],
      totalLength = _totalLength !== undefined ? _totalLength : list.reduce(function (totalLength, array) {
    return totalLength + array.length;
  }, 0),
      buffer = this.from([], 0, totalLength);

  list.reduce(function (offset, buf) {
    buffer.set(buf, offset);
    return offset + buf.length;
  }, 0);

  return buffer;
};

var buffer = Buffer;

Object.assign = function (target) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  for (var i in args) {
    var obj = args[i];
    if (obj instanceof Object) {
      for (var key in obj) {
        target[key] = obj[key];
      }
    }
  }

  return target;
};

var _defProp = Object.defineProperty;

Object.defineProperty = function (obj, prop, descriptor) {
  try {
    return _defProp(obj, prop, descriptor);
  } catch (e) {
    if (descriptor.get) {
      obj.value = descriptor.get();
    } else if (descriptor.value) {
      obj[prop] = descriptor.value;
    }

    return obj;
  }
};

Object.defineProperties = function (obj, descriptors) {
  for (var prop in descriptors) {
    var descriptor = descriptors[prop];
    Object.defineProperty(obj, prop, descriptor);
  }
  return obj;
};

var ON = 1;
var OFF = 0;

if (process.env.CHIP && process.env.CHIP.toUpperCase() == 'ESP32') {
  ON = 0;
  OFF = 1;
} else {
  
}

var defaultTimeout = 20;

var once = function once(led, timeout, cb) {
  // D5.write(0)
  // console.log('on')
  led.write(ON);
  setTimeout(function () {
    // D5.write(1)
    // console.log('off')
    led.write(OFF);
    cb && cb();
  }, timeout || defaultTimeout);
};

var _named = (function (name, f) {
  return Object.defineProperty(f, 'name', { value: name });
});

var data = { SUPER_CHAIN_PROTO_PROP: "_super",
  SUPER_CHAIN_APPLY_PROP: "_apply",
  PROTOTYPE_IS_EXTENDED_PROP: "_isExtended" };

var SUPER_CHAIN_PROTO_PROP = data.SUPER_CHAIN_PROTO_PROP;
var SUPER_CHAIN_APPLY_PROP = data.SUPER_CHAIN_APPLY_PROP;
var PROTOTYPE_IS_EXTENDED_PROP = data.PROTOTYPE_IS_EXTENDED_PROP;

var _copyChain = function _copyChain(Extended, ProtoChain, chainPropName, ignoreExtended) {
  //if chain on [Extended] has not been created yet
  if (!Extended.prototype[chainPropName]) {
    Object.defineProperty(Extended.prototype, chainPropName, {
      value: []
    });
  }

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

    if (shouldBePushed) {
      Extended.prototype[chainPropName].push(Proto);
    }
  });

  //console.log(Extended.prototype[chainPropName])
};

var _extend = function _extend() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!options.apply) options.apply = [];
  if (!options.proto) options.proto = [];
  // if ( !options.static )
  //   options.static = []

  var Child = options.proto[0];

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

  // for ( let i in options.static ) {
  //   for ( let prop in options.static[ i ] ) {
  //     if ( 'prototype' != prop ) {
  //       Object.defineProperty( Extended, prop, {
  //         value: proto[ prop ],
  //         enumerable: true,
  //         writable: true
  //       } )
  //     }
  //   }
  // }

  Object.defineProperty(Extended, 'prototype', {
    value: {}
  });
  Object.defineProperty(Extended.prototype, 'constructor', {
    value: Child
  });
  Object.defineProperty(Extended.prototype, PROTOTYPE_IS_EXTENDED_PROP, {
    value: true
  });

  for (var i in options.proto) {
    var Proto = function Proto() {};

    Proto.prototype = options.proto[i].prototype;
    var proto = new Proto();

    for (var prop in proto) {
      if (['constructor', PROTOTYPE_IS_EXTENDED_PROP, SUPER_CHAIN_PROTO_PROP, SUPER_CHAIN_APPLY_PROP].indexOf(prop) < 0) {
        Object.defineProperty(Extended.prototype, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        });
      }
    }
  }

  _copyChain(Extended, options.proto, SUPER_CHAIN_PROTO_PROP, false);
  _copyChain(Extended, options.apply, SUPER_CHAIN_APPLY_PROP, true);

  return Extended;
};

var loop = [
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

var setImmediate = asyncCall( /* .immediate */0);

var timeoutCall = asyncCall( /* .timeeout */1);

function EventEmitter() {
  this._listeners = {};
}

//_named('EventEmitter', EventEmitter)

function _duplicateEvent(event) {
  if (event) {
    if ('#' + event in this) {
      this._listeners[event] = this['#' + event];
    } else {
      delete this._listeners[event];
    }
  }
}

EventEmitter.prototype = {
  on: function on(event, listener) {
    Object.prototype.on.call(this, event, listener);
    _duplicateEvent.call(this, event);

    // this._listeners[event]
    //   ? this._listeners[event].push(listener)
    //   : this._listeners[event] = [listener]

    return this;
  },
  removeListener: function removeListener(event, listener) {
    Object.prototype.on.call(this, event, listener);
    _duplicateEvent.call(this, event);
    // if(!event) {
    //   this._listeners = {}
    // } else {
    //   if(listener && this._listeners[event]) {
    //     const index = this._listeners[event].indexOf(listener)
    //
    //     if(~index) {
    //       this._listeners[event].splice(index, 1)
    //     }
    //   }
    //
    //   if(!listener || !this._listeners[event]) {
    //     delete this._listeners[event]
    //   }
    // }
    return this;
  },
  once: function once(event, listener) {
    function once() {
      this.removeListener(event, _listener);
      return listener.apply(this, arguments);
    }

    return this.on(event, once);
  }
};

var bufferFrom = require('buffer-from');

function BufferState() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Object.assign(this, {
    _buffer: [],
    length: 0
  }, options);
}

function createNode(chunk) {
  return {
    chunk: bufferFrom(chunk),
    encoding: 'binary',
    next: null
  };
}

BufferState.prototype = {
  push: function push(chunk) {
    if (chunk.length) {
      var node = createNode(chunk);

      if (this._buffer.length) {
        this._buffer[this._buffer.length - 1].next = node;
      }

      this._buffer.push(node);
      this.length += node.chunk.length;
    }

    return this.length;
  },
  unshift: function unshift(chunk) {
    var node = createNode(chunk);

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
      var chunk = this._buffer[nodeIndex].chunk;
      if (index < chunk.length) {
        return {
          index: index,
          nodeIndex: nodeIndex,
          value: chunk[index]
        };
      }

      index -= chunk.length;
    }
  },
  for: function _for(from, to, callee) {
    var firstNode = this._buffer[from.nodeIndex];
    for (var index = from.nodeIndex; index < firstNode.chunk.length; index++) {
      callee.call(this, firstNode.chunk[index]);
    }

    for (var nodeIndex = 1 + from.nodeIndex; nodeIndex < to.nodeIndex; nodeIndex++) {
      var node = this._buffer[nodeIndex];
      for (var _index = 0; _index < node.chunk.length; _index++) {
        callee.call(this, node.chunk[_index]);
      }
    }

    if (from.nodeIndex < to.nodeIndex) {
      var lastNode = this._buffer[to.nodeIndex];
      for (var _index2 = 0; _index2 <= to.index; _index2++) {
        callee.call(this, lastNode.chunk[_index2]);
      }
    }
  },
  slice: function slice(length) {
    if (length === undefined) {
      length = this.length;
    }

    if (!length) {
      return bufferFrom([]);
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

    var buffer = bufferFrom(Array(length));

    var offset = this._buffer.slice(to.nodeIndex - 1).reduce(function (offset, node) {
      buffer.set(node.chunk, offset);
      return offset + node.chunk.length;
    }, 0);

    if (offset < length) {
      var node = this._buffer[to.nodeIndex];

      buffer.set(node.chunk.slice(0, length - offset), offset);
    }

    return buffer;
  },
  buffer: function buffer(length) {
    if (length === undefined) {
      length = this.length;
    }

    if (!length) {
      return bufferFrom([]);
    }

    if (length > this.length) {
      length = this.length;
    }

    var to = void 0;

    if (length) {
      // console.time('at')
      to = this.at(length);
      // console.timeEnd('at')
    }

    if (!to) {
      to = {
        index: this.length - 1,
        nodeIndex: this._buffer.length - 1
      };
    }
    // console.time('from')
    var buffer = bufferFrom(Array(length));
    // console.timeEnd('from')
    // console.time('offset')

    // console.timeEnd('buffer')

    var offset = this.nodes(to.nodeIndex).reduce(function (offset, node) {
      buffer.set(node.chunk, offset);
      return offset + node.chunk.length;
    }, 0);
    // console.timeEnd('offset')

    if (offset < length) {
      var node = this.nodes(1)[0];

      buffer.set(node.chunk.slice(0, length - offset), offset);
      if (length - offset < node.chunk.length) {
        node.chunk = node.chunk.slice(length - offset);

        this.unshift(node.chunk);
      }
    }

    return buffer;
  }
};

function series(arr, cb, done) {
  var i = 0;
  var aborted = false;
  (function next(res) {
    if (!aborted) {
      if (typeof res !== 'undefined' || i >= arr.length) {
        done && done(res);
      } else {
        setImmediate(function () {
          try {
            cb(next, arr[i], i++, arr);
          } catch (err) {
            next(err);
            aborted = true;
          }
        });
      }
    }
  })();
}

var _typeof$2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//import Schedule from 'schedule'
var DEFAULT_HIGHWATERMARK = 64;

function _resetWatcher(watcher) {
  return Object.assign(watcher, {
    active: false,
    currentPattern: null,
    length: 0,
    offset: 0,
    byteIndex: 0,
    patternIndex: 0
  });
}

function _resetActive() {
  this._busState.active = 0;
  this.emit('inactive');
}

function _decrementActive() {
  if (! --this._busState.active) {
    this.emit('inactive');
  }
}

function _found(watcher) {
  var _busState = this._busState;
  var watching = _busState.watching;

  var chunk = _busState.buffer(watcher.length);
  _busState.nodeIndex = -1;
  try {
    // console.time( 'cb' )
    watcher.callback(chunk,
    // frame.splice(-watcher.length),
    watcher);
    // console.timeEnd( 'cb' )
  } catch (err) {
    this.emit('error', err);
  }
  // _busState.watching = []
  // console.time( 'reset' )
  watching.forEach(_resetWatcher);
  _resetActive.call(this);
  // console.timeEnd( 'reset' )
}

function _nextPattern(watcher) {
  if (1 + watcher.patternIndex < watcher.list.length) {
    // console.time('next pattern')
    var nextPattern = watcher.list[++watcher.patternIndex /* patternIndex has already been incremented when checked condition */];
    watcher.byteIndex = 0;

    if (typeof nextPattern == 'function') {
      try {
        watcher.currentPattern = nextPattern.call(this, this._busState.slice(1 + watcher.length));
      } catch (err) {
        _resetWatcher(watcher);
        _decrementActive.call(this);
        this.emit('error', err);
      }
    } else {
      watcher.currentPattern = nextPattern;
    }
    // console.timeEnd('next pattern')
  } else {
    _found.call(this, watcher);
  }
}

function _push() {
  var _this = this;

  // console.log( '_push()' )
  var _busState = this._busState;
  var watching = _busState.watching,
      _buffer = _busState._buffer;


  for (; _busState.nodeIndex < _buffer.length; _busState.nodeIndex++) {
    if (!watching.length) {
      this.emit('error', {
        msg: 'Unexpected incoming data',
        data: _busState.buffer()
      });
      return;
    }

    if (_busState.nodeIndex < 0) {
      _busState.nodeIndex = 0;
    }

    var chunk = _buffer[_busState.nodeIndex].chunk;

    var currentChunkIndex = 0;
    var watcherIndex = 0;
    var isEqual = false;
    if (!_busState.active) {
      _busState.active = _busState.watching.reduce(function (active, watcher) {
        var list = watcher.list;

        try {
          watcher.currentPattern = typeof list[0] == 'function' ? list[0].call(_this, _busState.slice(watcher.length)) : list[0];
          watcher.active = true;
          return 1 + active;
        } catch (err) {
          _this.emit('error', err);
          return active;
        }
      }, 0);
    }

    for (; currentChunkIndex < chunk.length; currentChunkIndex++) {
      var byte = chunk[currentChunkIndex];

      for (watcherIndex = 0; watcherIndex < watching.length; watcherIndex++, isEqual = false) {
        var watcher = watching[watcherIndex];
        if (!watcher.active) {
          continue;
        }

        var currentPattern = watcher.currentPattern;


        if (Array.isArray(currentPattern) || ArrayBuffer.isView(currentPattern)) {
          var expected = currentPattern[watcher.byteIndex];

          if (expected === undefined || typeof expected == 'number' && expected === byte) {
            isEqual = true;
          } else if (typeof expected == 'function') {
            try {
              isEqual = !!expected.call(this, byte, watcher.length - 1 /*i.e. index*/, _busState.slice(1 + watcher.length /*i.e. actual length*/));
            } catch (err) {
              this.emit('error', err);
            }
          }

          // if ( !isEqual ) {
          //   console.log( 'current watching:', watcher.currentPattern )
          //   console.log( 'current chunk:', chunk )
          //   console.log( 'byte:', byte )
          //   console.log( 'expected:', expected )
          // }

          if (isEqual) {
            ++watcher.length;

            if (1 + watcher.byteIndex < currentPattern.length) {
              ++watcher.byteIndex;
            } else {
              _nextPattern.call(this, watcher);
            }
          } else {
            _resetWatcher(watcher);
            _decrementActive.call(this);

            // console.log( 'active', _busState.active )

            if (!_busState.active) {
              this.emit('error', {
                message: 'Unparsed chunk',
                expected: expected,
                actual: byte,
                pattern: currentPattern,
                chunk: _busState.buffer(),
                index: currentChunkIndex,
                value: byte
              });
            }

            // break
          }
        } else if (typeof currentPattern == 'number') {
          if (currentPattern <= 0) {
            throw Object.assign(new ReferenceError('Pattern length should be a positive integer'), {
              pattern: currentPattern
            });
          }

          if (watcher.offset <= 0) {
            watcher.offset = currentPattern;
          }

          watcher.length++;

          if (--watcher.offset < 1) {
            _nextPattern.call(this, watcher);
          }
        } else {
          throw new TypeError('Cannot parse pattern of ' + (typeof currentPattern === 'undefined' ? 'undefined' : _typeof$2(currentPattern)) + ' type');
        }
      }
    }
  }

  if (_busState.active) {
    this.emit('drain');
  }
}

function _Bus$1() {
  var _this2 = this;

  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  this.transport = options.transport;
  this.type = options.type;
  this._setup = options.setup.bind(this);
  this._read = function (length) {
    return options.read.call(_this2, length === undefined ? length : _this2.options.highWaterMark);
  };
  this._write = options.write.bind(this);

  this.options = {
    highWaterMark: options.highWaterMark || DEFAULT_HIGHWATERMARK
  };

  this._busState = new BufferState({
    watching: [],
    active: 0,
    nodeIndex: 0,
    configured: false,
    ticker: false
  });
}

_Bus$1.prototype = {
  setup: function setup() {
    if (this._busState.configured) {
      return Promise.reject('already configured');
    }

    this._busState.configured = true;
    return this._setup.apply(this, arguments);
  },
  push: function push(chunk) {
    var _this3 = this;

    // console.log( 'push()' )
    // console.log( chunk )
    if (chunk.length) {
      this._busState.push(chunk);

      if (!this._busState.ticker) {
        this._busState.ticker = true;
        setImmediate(function () {
          _this3._busState.ticker = false;
          _push.call(_this3);
        });
      }
    }
    // const highWaterMark = this.options.highWaterMark,
    //       parse = _parse.bind(this)
    //
    // if(chunk.length > highWaterMark) {
    //   const chunks = []
    //   let subchunkIndex = 0
    //
    //   for(let bytesLeft = chunk.length, offset = 0; bytesLeft > 0; bytesLeft -= highWaterMark) {
    //     const subchunk = chunk.slice(offset, offset += highWaterMark)
    //     chunks.push(subchunk)
    //   }
    //
    //   series(chunks, (next, subchunk) => {
    //     parse(subchunk)
    //     next()
    //   })
    // }
    // else {
    //   parse(chunk)
    // }
  },
  watch: function watch(list, cb) {
    var watcher = _resetWatcher({
      list: list,
      callback: cb.bind(this)
    });

    this._busState.watching.push(watcher);

    return watcher;
  },
  unwatch: function unwatch(watcher) {
    if (watcher) {
      var index = this._busState.watching.indexOf(watcher);

      if (index >= 0) {
        if (this._busState.watching[index].active) {
          _resetWatcher(watcher);
          _decrementActive.call(this);
        }

        this._busState.watching.splice(index, 1);
      }
    } else {
      this._busState.watching.splice(0);
      _resetActive.call(this);
    }

    return this;
  },


  /**
    @TODO Promise interface
  */

  expect: function expect(list) {
    var _this4 = this;

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var cb = void 0,
        options = {};

    if (typeof args[0] == 'function') {
      cb = args[0];
    } else if (typeof args[1] == 'function') {
      cb = args[1];
      Object.assign(options, args[0]);
    } else {
      throw new ReferenceError('Callback is not provided');
    }

    var watcher = void 0;
    var setWatcher = function setWatcher() {
      watcher = _this4.watch(list, function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        _this4.unwatch(watcher);
        cb.apply(_this4, args);
      });
      _this4._read(_this4.options.highWaterMark);
    };

    // if ( 'timeout' in options ) {
    //   setTimeout( setWatcher, options.timeout )
    // } else {
    //
    // }

    setWatcher();

    return watcher;
  },
  send: function send(binary) {
    var _this5 = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if ('timeout' in options) {
      setTimeout(function () {
        _this5._write(binary);
      }, options.timeout);
    } else {
      this._write(binary);
    }

    return this;
  },
  reset: function reset() {
    this._busState.watching.splice(0);
    return this;
  }
};

var Bus$1 = _extend({
  proto: [EventEmitter, _Bus$1],
  apply: [EventEmitter, _Bus$1]
});

var data$2 = { PN532_PREAMBLE: 0,
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
  PN532_COMMAND_WAKEUP: 85,
  PN532_SPI_STATREAD: 2,
  PN532_SPI_DATAWRITE: 1,
  PN532_SPI_DATAREAD: 3,
  PN532_SPI_READY: 1,
  PN532_I2C_ADDRESS: 36,
  PN532_I2C_READBIT: 1,
  PN532_I2C_BUSY: 0,
  PN532_I2C_READY: 1,
  PN532_I2C_READYTIMEOUT: 20,
  MIFARE_COMMAND_AUTH_A: 96,
  MIFARE_COMMAND_AUTH_B: 97,
  MIFARE_COMMAND_READ_16: 48,
  MIFARE_COMMAND_WRITE_4: 162,
  MIFARE_COMMAND_WRITE_16: 160,
  MIFARE_COMMAND_TRANSFER: 176,
  MIFARE_COMMAND_DECREMENT: 192,
  MIFARE_COMMAND_INCREMENT: 193,
  MIFARE_COMMAND_RESTORE: 194,
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
  NFC_COMMAND_BUF_LEN: 64,
  NFC_FRAME_ID_INDEX: 6 };

var PN532_PREAMBLE = data$2.PN532_PREAMBLE;
var PN532_STARTCODE1 = data$2.PN532_STARTCODE1;
var PN532_STARTCODE2 = data$2.PN532_STARTCODE2;
var PN532_POSTAMBLE = data$2.PN532_POSTAMBLE;
var PN532_HOST_TO_PN532 = data$2.PN532_HOST_TO_PN532;
var PN532_PN532_TO_HOST = data$2.PN532_PN532_TO_HOST;

var PN532_COMMAND_GETFIRMWAREVERSION = data$2.PN532_COMMAND_GETFIRMWAREVERSION;







var PN532_COMMAND_SAMCONFIGURATION = data$2.PN532_COMMAND_SAMCONFIGURATION;





var PN532_COMMAND_INLISTPASSIVETARGET = data$2.PN532_COMMAND_INLISTPASSIVETARGET;


var PN532_COMMAND_INDATAEXCHANGE = data$2.PN532_COMMAND_INDATAEXCHANGE;













var PN532_COMMAND_WAKEUP = data$2.PN532_COMMAND_WAKEUP;




var PN532_I2C_ADDRESS = data$2.PN532_I2C_ADDRESS;




var MIFARE_COMMAND_AUTH_A = data$2.MIFARE_COMMAND_AUTH_A;

var MIFARE_COMMAND_READ_16 = data$2.MIFARE_COMMAND_READ_16;

var MIFARE_COMMAND_WRITE_16 = data$2.MIFARE_COMMAND_WRITE_16;



















































var PN532_BRTY_ISO14443A = data$2.PN532_BRTY_ISO14443A;
var PN532_BRTY_ISO14443B = data$2.PN532_BRTY_ISO14443B;

var check = function check(values) {
  return !(0xff & -values.reduce(function (sum, value) {
    return sum + value;
  }, 0));
};

var LCS = function LCS(byte, length, frame) {
  return check(frame.slice(-2));
};

var CHECKSUM = function CHECKSUM(byte, length, frame) {
  return check(frame.slice(5));
};

var BODY = function BODY(frame) {
  return frame[3] - 1;
}; /* response code + payload */

var INFO = [[PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, undefined, LCS, PN532_PN532_TO_HOST], BODY, [CHECKSUM, PN532_POSTAMBLE]];



var ERR = [[PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x01, 0xff, undefined, CHECKSUM, PN532_POSTAMBLE]];

var ACK = [new Uint8Array([PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x00, 0xff, PN532_POSTAMBLE])];

var NACK = [new Uint8Array([PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0xff, 0x00, PN532_POSTAMBLE])];

var command = function command(_command) {
  return new Uint8Array([PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0xff & _command.length + 1, 0xff & ~_command.length, PN532_HOST_TO_PN532].concat(_command, [
  // checksum
  0xff & -_command.reduce(function (checksum, byte) {
    return checksum + byte;
  }, PN532_HOST_TO_PN532), PN532_POSTAMBLE]));
};

var parseInfo = function parseInfo(chunk) {
  return {
    raw: chunk,
    code: chunk[6],
    body: chunk.slice(7, 5 + chunk[3])
  };
};

var parseBlockData = function parseBlockData(data) {
  if (data.body.length == 1) {
    throw {
      cmd: data.code,
      code: data.body[0]
    };
  } else {
    return {
      chunk: data.body.slice(1)
    };
  }
};

function _Bus() {}

_Bus.prototype = {
  makeTransaction: function makeTransaction(cmd, info, parsers) {
    var _this = this;

    return new Promise(function (done, fail) {
      // Don't be silly again - info frame refers to index from beginning, i.e. to ACK
      // this.expect([...ACK, ...info], chunk => done((parsers || [sliceAck, parseInfo]).reduce((data, parse) => parse(data), chunk)))
      _this.expect(ACK, function () {
        _this.expect(info, function (chunk) {
          var _parsers = parsers || [parseInfo];
          done(_parsers.reduce(function (data, parse) {
            return parse(data);
          }, chunk));
        });
      });

      _this.expect(NACK, fail);
      _this.expect(ERR, fail);

      _this.send(command(cmd));
    }).catch(function (err) {
      _this.unwatch();
      throw err;
    }).then(function (data) {
      _this.unwatch();
      return data;
    });
  },
  findTargets: function findTargets(count, type) {
    if (type == 'A') {
      type = PN532_BRTY_ISO14443A;
    } else if (type == 'B') {
      type = PN532_BRTY_ISO14443B;
    } else {
      throw new Error('Unknown ISO14443 type:', '"' + type + '"');
    }

    return this.makeTransaction([PN532_COMMAND_INLISTPASSIVETARGET, count, type], INFO, [function (chunk) {
      var body = chunk.slice(7, 5 + chunk[3]);
      var uid = body.slice(6, 6 + body[5]);
      return {
        code: chunk[6],
        body: body,
        count: body[0],
        atqa: body.slice(2, 4), // SENS_RES
        sak: body[4],
        uid: uid
      };
    }]);
  },
  authenticate: function authenticate(block, uid, key) {
    return this.makeTransaction([PN532_COMMAND_INDATAEXCHANGE, 1, MIFARE_COMMAND_AUTH_A, block].concat([].slice.call(key), [].slice.call(uid)), INFO);
  },
  readBlock: function readBlock(block) {
    return this.makeTransaction([PN532_COMMAND_INDATAEXCHANGE, 1, MIFARE_COMMAND_READ_16, block], INFO, [parseInfo, parseBlockData]);
  },
  writeBlock: function writeBlock(block, chunk) {
    return this.makeTransaction([PN532_COMMAND_INDATAEXCHANGE, 1, MIFARE_COMMAND_WRITE_16, block].concat([].slice.call(chunk)), INFO);
  },
  readSector: function readSector(sector) {
    var _this2 = this;

    return new Promise(function (done, fail) {
      var readBlocksArr = [];
      for (var block = sector * 4; block < sector * 4 + 3; block++) {
        readBlocksArr.push(block);
      }

      series(readBlocksArr, function (next, block, index) {
        _this2.readBlock(block).then(function (data) {
          readBlocksArr[index] = data;
          next();
        }).catch(function (err) {
          console.log('!!!');
          next(err);
        });
      }, function (err) {
        return err ? fail(err) : done(readBlocksArr);
      });
    });
  },
  writeSector: function writeSector(start, chunk) {}
};

var Bus = _extend({
  proto: [Bus$1, _Bus],
  apply: [Bus$1, _Bus]
});

// import Bus from 'bus'
//
// const preamble = [ 1, 2, 3 ]
// const postamble = [ 4, ( {
//   getFrame,
//   getAbsoluteIndex,
//   getRelativeIndex
// } ) => {
//   console.log( getAbsoluteIndex( 1 ), getRelativeIndex( 0 ) )
//   return true
// }, 6 ]
//
// const bus = new Bus( {
//   read() {},
//   write() {},
//   setup() {}
// } )
//
// bus.on( 'error', console.error )
//
// bus.expect( [
//   preamble,
//   postamble
// ], console.log )
//
// bus.push( preamble )
// bus.push( postamble )

// import Bus from 'bus'
// import Schedule from 'schedule'
function setup() {
  var _this = this;

  if (this.type == 'serial') {
    this.transport.setup(115200);

    this.transport.on('data', function (data) {
      console.log(buffer.from(data));
      _this.push(data);
    });

    this.transport.write(PN532_COMMAND_WAKEUP);

    console.log('configuring sam');
    this.send(command([PN532_COMMAND_SAMCONFIGURATION, 0x01, 20, 0]));
    this.expect(ACK, function () {
      console.log('sam ACK');
    });
    this.expect(INFO, function () {
      console.log('sam configured');

      once(LED1, 20, function () {
        setTimeout(function () {
          return once(LED1, 20);
        }, 200);
      });
    });
  } else if (this.type == 'i2c') {
    this.transport.setup({
      bitrate: 400 * 1000
    });

    this.on('drain', function () {
      _this._read();
    });

    try {
      this.send(1);
    } catch (err) {
      console.log('Handled', err.msg);
      console.log('Continue...');
    }

    this.send(command([PN532_COMMAND_GETFIRMWAREVERSION]));

    this.expect([].concat(ACK, INFO), {
      timeout: 10
    }, function (frame) {
      console.log('frame');
      console.log(frame);
    });
  }
}

var bus = new Bus({
  transport: Serial1,
  type: 'serial',
  setup: setup,
  read: function read(length) {
    if (this.type == 'i2c') {
      while (true) {
        if (this.transport.readFrom(PN532_I2C_ADDRESS, 1)[0]) {
          var chunk = this.transport.readFrom(PN532_I2C_ADDRESS, 1 + length);
          this.push(chunk);
        } else {
          break;
        }
      }
    } else if (this.type == 'serial') {
      // const chunk = this.transport.read(length)
      // this.push(chunk)
    }
  },
  write: function write(chunk) {
    if (this.type == 'serial') {
      this.transport.write(chunk);
    } else if (this.type == 'i2c') {
      this.transport.writeTo(PN532_I2C_ADDRESS, chunk);
    }
  },

  highWaterMark: 16
});

bus.on('error', function (err) {
  console.error('BusError:', err);
});

bus.setup();

var key = new Uint8Array(Array(6).fill(0xff));

setTimeout(function () {
  Promise.resolve().then(function () {
    (function poll() {
      var sector = 1;
      console.log(process.memory().free);
      console.log(bus._busState.watching.length);
      Promise.resolve().then(function () {
        return bus.findTargets(2, 'A');
      }).then(function (data) {
        console.log('found target', data);
        LED1.write(1);
        return data;
      }).then(function (data) {
        return bus.authenticate(sector * 4, data.uid, key);
      }).then(function (data) {
        console.log('auth', data);
      })
      // .then( data => bus.writeBlock( 4, [ 1, 3, 6, 4 ] ) )
      // .then( data => {
      //   console.log( 'write op:', data )
      // } )
      .then(function (data) {
        console.log('reading', sector, 'sector');
        return data;
      }).then(function (data) {
        return bus.readSector(sector);
      }).then(function (data) {
        console.log('after init', data);
        return data;
      })
      // .then( () => new Promise( ( done, fail ) => {
      //   console.log( 'COMMAND InAutoPoll' )
      //   bus.expect( ACK, () => {
      //     console.log( 'ACK InAutoPoll' )
      //     bus.expect( INFO, frame => {
      //       let index = 7
      //       // console.log( 'RESPONSE ( raw ) InAutoPoll', frame )
      //       const data = {
      //         count: frame[ index ],
      //         targets: []
      //       }
      //       for ( let i = 0; i < data.count; i++ ) {
      //         const type = frame[ ++index ]
      //         const length = frame[ ++index ]
      //
      //         const targetRaw = frame.slice( ++index, index += length )
      //
      //         // console.log( 'targetRaw', targetRaw )
      //
      //         const targetData = {
      //           type: type & 7,
      //           br106A: ( type & 7 ) == 0,
      //           br106B: ( type & 7 ) == 3,
      //           br212: ( type & 7 ) == 1,
      //           br424: ( type & 7 ) == 2,
      //
      //           mifareOrFelica: !!( type & 16 ),
      //           isoCompilant: !!( type & 32 ),
      //           dep: !!( type & 64 ),
      //           active: !!( type & 128 )
      //         }
      //
      //         if ( targetData.dep ) {
      //           let offset = 0
      //
      //           if ( !targetData.active ) {
      //             offset = parseDEP( targetRaw, targetData )
      //           }
      //
      //           Object.assign( targetData, {
      //             NFCID3t: targetRaw.slice( offset, offset + 10 ),
      //             DIDt: frame[ offset + 10 ],
      //             BSt: frame[ offset + 11 ],
      //             BRt: frame[ offset + 12 ],
      //             TO: frame[ offset + 13 ],
      //             PPt: frame[ offset + 14 ],
      //             Gt: targetRaw.slice( offset + 15, targetRaw.length )
      //           } )
      //         } else {
      //           parseDEP( targetRaw, targetData )
      //         }
      //
      //         data.targets.push( targetData )
      //       }
      //
      //       console.log( 'RESPONSE InAutoPoll', data )
      //
      //       done( data )
      //     } )
      //   } )
      //
      //   bus.send( command( [
      //     0x60,
      //     0xff, // poll n
      //     0x01, // period = n * 150 ms
      //     0x42, 0x82
      //   ] ) )
      // } ) )
      // .then( found => new Promise( ( done, fail ) => {
      //   bus.expect( ACK, () => {
      //     console.log( 'initAsTarget ACK' )
      //     bus.expect( INFO, frame => {
      //       bus.send( ...ACK )
      //       bus.unwatch()
      //
      //       const data = {
      //         mode: {
      //           baudrate: ( frame[ 8 ] & 112 ) >> 4,
      //           picc: !!( frame[ 8 ] & 15 ),
      //           dep: !!( frame[ 8 ] & 4 ),
      //           framingType: frame[ 8 ] & 3
      //         },
      //         initiatorCommand: frame.slice( 9, -2 )
      //       }
      //
      //       console.log( 'initAsTarget RESPONSE', data )
      //       console.log( 'initAsTarget COMMAND', toHexString( data.initiatorCommand ) )
      //
      //       done( data )
      //     } )
      //   } )
      //
      //   bus.expect( ERR, fail )
      //   bus.expect( NACK, fail )
      //
      //   const c = command( [
      //     0x8c,
      //     1,
      //
      //     0x00, 0x00, //SENS_RES
      //     ...NFCID3.slice( 0, 3 ), //NFCID1
      //     0x40, //SEL_RES
      //
      //     0x01, 0xFE, 0x0F, 0xBB, 0xBA, 0xA6, 0xC9, 0x89, // POL_RES
      //     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      //     0xFF, 0xFF,
      //
      //     ...NFCID3,
      //
      //     13, // length gt
      //
      //     0x46, 0x66, 0x6d,
      //     0x01, 0x01, 0x11,
      //     0x03, 0x02, 0x00, 0x13,
      //     0x04, 0x01, 0x96,
      //
      //     0 // Tk length
      //   ] )
      //
      //   // console.log( c )
      //
      //   bus.send( c )
      // } ) )
      // .then( data => new Promise( ( done, fail ) => {
      //   bus.expect( ACK, () => {
      //     console.log( 'TgResponseToInitiator ACK' )
      //     bus.expect( INFO, frame => {
      //
      //       console.log( 'TgResponseToInitiator RESPONSE', frame )
      //
      //       bus.send( ...ACK )
      //       bus.unwatch()
      //
      //       done()
      //     } )
      //   } )
      //
      //   bus.expect( ERR, fail )
      //   bus.expect( NACK, fail )
      //
      //   bus.send( command( [
      //     0x90,
      //     0x1f,
      //     0xd5, 0x01,
      //     ...NFCID3,
      //     0,
      //     0,
      //     0,
      //     0x0e,
      //     0x32,
      //
      //     0x46, 0x66, 0x6D,
      //     0x01, 0x01, 0x12,
      //     0x03, 0x02, 0x00, 0x13,
      //     0x04, 0x01, 0x64
      //   ] ) )
      // } ) )
      // .then( data => new Promise( ( done, fail ) => {
      //   bus.expect( ACK, () => {
      //     console.log( 'TgGetInitiatorCommand ACK' )
      //     bus.expect( INFO, frame => {
      //
      //       console.log( 'TgGetInitiatorCommand RESPONSE', toHexString( frame ) )
      //
      //       bus.send( ...ACK )
      //       bus.unwatch()
      //
      //       done()
      //     } )
      //   } )
      //
      //   bus.expect( ERR, fail )
      //   bus.expect( NACK, fail )
      //
      //   bus.send( command( [
      //     0x88
      //   ] ) )
      // } ) )
      // .then( data => new Promise( ( done, fail ) => {
      //   bus.expect( ACK, () => {
      //     console.log( 'TgResponseToInitiator ACK' )
      //     bus.expect( INFO, frame => {
      //
      //       console.log( 'TgResponseToInitiator RESPONSE', toHexString( frame ) )
      //
      //       bus.send( ...ACK )
      //       bus.unwatch()
      //
      //       done()
      //     } )
      //   } )
      //
      //   bus.expect( ERR, fail )
      //   bus.expect( NACK, fail )
      //
      //   bus.send( command( [
      //     0x90,
      //     0x06,
      //     0xd4, 0x06,
      //     0x00,
      //     0x00, 0x00
      //   ] ) )
      // } ) )
      // .then( () => new Promise( ( done, fail ) => {
      //   const nack = setTimeout( () => {
      //     bus.send( ...ACK )
      //     bus.unwatch()
      //
      //     fail( 'no answer for tgGetTargetStatus!' )
      //   }, 1000 )
      //
      //   bus.expect( ACK, () => {
      //     console.log( 'tgGetTargetStatus ACK' )
      //     bus.expect( INFO, frame => {
      //       clearTimeout( nack )
      //       bus.unwatch()
      //       console.log( 'tgGetTargetStatus RESPONSE:' )
      //       console.log( toHexString( frame ) )
      //       done()
      //     } )
      //   } )
      //
      //   bus.send( command( [ 0x8a ] ) )
      // } ) )
      // .then( found => {
      //   return found.targets[ 0 ]
      // } )
      // .then( target => new Promise( ( done, fail ) => {
      //   console.log( 'requesting DEP exchange...' )
      //   bus.expect( ACK, () => {
      //     console.log( 'injumpfordep ACK' )
      //     bus.expect( INFO, frame => {
      //       const data = {
      //         code: frame[ 6 ],
      //         status: frame[ 7 ],
      //         targetNumber: frame[ 8 ],
      //         NFCID3t: frame.slice( 9, 19 ),
      //         DIDt: frame[ 19 ],
      //         BSt: frame[ 20 ],
      //         BRt: frame[ 21 ],
      //         TO: frame[ 22 ],
      //         PPt: frame[ 23 ],
      //         Gt: frame.slice( 24, -2 )
      //       }
      //
      //       console.log( 'injumpfordep RESPONSE', data )
      //       console.log( 'general bytes:', toHexString( data.Gt ) )
      //
      //       bus.send( ...ACK )
      //       bus.unwatch()
      //
      //       done( data )
      //     } )
      //   } )
      //
      //   bus.expect( ERR, fail )
      //   bus.expect( NACK, fail )
      //
      //   let payload = [
      //     0x56,
      //     target.active ? 0x00 : 0x01, // active
      //     target.baudrate
      //   ]
      //
      //   if ( !target.active ) {
      //     payload = [
      //       ...payload,
      //       6,
      //
      //       ...NFCID3,
      //
      //       // 0x25, // len,
      //       // 0xd4, 0x00, // atr req
      //       // 0x00,
      //       // 0x00,
      //       // 0x00,
      //       // 0x32,
      //
      //       0x46, 0x66, 0x6D,
      //       0x01, 0x01, 0x12,
      //       0x02, 0x02, 0x07, 0x80, // TLV: MIUX = 128 + MIU 1920
      //       0x03, 0x02, 0x00, 0x03, // TLV: Services
      //       0x04, 0x01, 0x64,
      //       0x07, 0x01, 0x03
      //     ]
      //   } else {
      //     payload = [
      //       ...payload,
      //       1,
      //
      //       0x01, 0x02, 0x03, 0x04, 0x05
      //     ]
      //   }
      //
      //   console.log( payload )
      //
      //   bus.send( command( payload ) )
      // } ) )
      // .then( target => new Promise( ( done, fail ) => {
      //   bus.expect( ACK, () => {
      //     console.log( 'indataexchange ACK' )
      //     bus.expect( INFO, frame => {
      //
      //       console.log( 'indataexchange RESPONSE', frame )
      //
      //       bus.send( ...ACK )
      //       bus.unwatch()
      //
      //       done( target )
      //
      //       // if ( frame[ 7 ] == frame[ 8 ] == frame[ 9 ] == 0x00 ) {
      //       //   console.log( 'SYMM received' )
      //       //   done( target )
      //       // } else {
      //       //   console.log( 'SYMM does not received' )
      //       //   fail()
      //       // }
      //     } )
      //   } )
      //
      //   bus.expect( ERR, fail )
      //   bus.expect( NACK, fail )
      //
      //   bus.send( command( [
      //     0x40,
      //     // target.targetNumber,
      //     0x06, // len
      //     0xd4, 0x06, // dep_req
      //     0x00, // PFB
      //     0x00, 0x00 // SYMM PDU
      //   ] ) )
      // } ) )
      // .then( target => new Promise( ( done, fail ) => {
      //   bus.expect( ACK, () => {
      //     console.log( 'indataexchange ACK' )
      //     bus.expect( INFO, frame => {
      //
      //       console.log( 'indataexchange RESPONSE', frame )
      //
      //       bus.send( ...ACK )
      //
      //       if ( frame[ 7 ] == frame[ 8 ] == frame[ 9 ] == 0x00 ) {
      //         console.log( 'SYMM_RES received' )
      //         done( target )
      //       } else {
      //         console.log( 'SYMM_RES does not received' )
      //         fail()
      //       }
      //     } )
      //   } )
      //
      //   bus.expect( ERR, fail )
      //   bus.expect( NACK, fail )
      //
      //   bus.send( command( [
      //     0x40,
      //     target.targetNumber,
      //     0x06, // len
      //     0xd4, 0x06, // dep_req
      //     0x01, // PFB
      //     0x00, 0x00 // SYMM PDU
      //   ] ) )
      // } ) )
      // .then( target => new Promise( ( done, fail ) => {
      //   bus.expect( ACK, () => {
      //     console.log( 'indataexchange ACK' )
      //     bus.expect( INFO, frame => {
      //
      //       console.log( 'indataexchange RESPONSE', frame )
      //       console.log( 'CONNECT PDU' )
      //
      //       bus.send( ...ACK )
      //
      //       done( target )
      //     } )
      //   } )
      //
      //   bus.expect( ERR, fail )
      //   bus.expect( NACK, fail )
      //
      //   bus.send( command( [
      //     0x40,
      //     target.targetNumber,
      //     0x1e, // len
      //     0x04, 0x06, // DEP_RES
      //     0x01, // info_pdu, pni 0
      //     0x05, 0x20, // CONNECT PDU
      //     0x06, // service name
      //     0x0f, // len
      //     ...[].slice.call( Buffer.from( 'urn:nfc:sn:snep' ) ),
      //     0x02, 0x02, 0x07, 0x80, // TLV MIUX
      //     0x05, 0x01, 0x04 // TLV RWS
      //   ] ) )
      // } ) )
      // // .then( found => new Promise( ( done, fail ) => {
      //   bus.expect( ACK, () => {
      //     console.log( 'tgGetData ack' )
      //     bus.expect( INFO, frame => {
      //
      //       console.log( 'tgGetData response', frame )
      //
      //       bus.send( ...ACK )
      //
      //       done()
      //     } )
      //   } )
      //
      //   bus.expect( ERR, fail )
      //   bus.expect( NACK, fail )
      //
      //   bus.send( command( [
      //     0x86
      //   ] ) )
      // } ) )
      // .then( data => bus.authenticate( 4, data.uid, key ) )
      // .then( data => {
      //   console.log( 'auth', data )
      // } )
      // .then( found => new Promise( ( done, fail ) => {
      //   bus.expect( ACK, () => {
      //     console.log( 'indataexchange ack' )
      //     bus.expect( INFO, frame => {
      //       console.log( 'indataexchange response', frame )
      //       done()
      //     } )
      //   } )
      //
      //   bus.expect( ERR, fail )
      //   bus.expect( NACK, fail )
      //
      //   bus.send( command( [
      //     0x40,
      //     1
      //   ] ) )
      // } ) )
      // .then(data => { console.log('sector 2:', data); return data })
      // .then( data => data.reduce( ( buffer, data ) => [ ...buffer, ...[].slice.call( data.chunk, 0 ) ], [] ) )
      // .then( console.log )
      // .then(data => { console.timeEnd('reading 2 sector'); return data })
      // .then(data => bus.readBlock(4)).then(data => { console.log('block 4:', data) })
      // .then(data => bus.readBlock(5)).then(data => { console.log('block 5:', data) })
      // .then(data => bus.readBlock(6)).then(data => { console.log('block 6:', data) })
      // .then(data => bus.readBlock(7)).then(data => { console.log('block 7:', data) })
      .catch(function (err) {
        console.error('Error:', err);
      }).then(function () {
        LED1.write(0);
        LED2.write(0);

        bus.send.apply(bus, ACK);
        bus.unwatch();

        setTimeout(function () {
          poll();
        }, 500);
      });
    })();
  }).catch(console.error);
}, 1000);
