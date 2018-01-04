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

var defProp = function defProp(obj, prop, desc) {
  try {
    return Object.defineProperty(obj, prop, desc);
  } catch (e) {
    if (desc.get) {
      obj.value = desc.get();
    } else if (desc.value) {
      obj[prop] = desc.value;
    }

    return obj;
  }
};

var _named = (function (name, f) {
  defProp(f, 'name', { value: name });
  //defProp(f, 'toString', { value: () => '[Function' + (f.name !== undefined ? ': ' + f.name : '') + ']' })

  return f;
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
    Object.defineProperty(Extended.prototype, chainPropName, { value: [] });
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
        Object.defineProperty(Extended, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        });
      }
    }
  }

  Extended.prototype = {};
  Extended.prototype.constructor = Child;
  Extended.prototype[PROTOTYPE_IS_EXTENDED_PROP] = true;

  for (var _i in options.super) {
    var Proto = function Proto() {};

    Proto.prototype = options.super[_i].prototype;
    var _proto = new Proto();

    for (var _prop in _proto) {
      if (['constructor', PROTOTYPE_IS_EXTENDED_PROP, SUPER_CHAIN_PROTO_PROP, SUPER_CHAIN_APPLY_PROP].indexOf(_prop) < 0) {
        Object.defineProperty(Extended.prototype, _prop, {
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function Buffer() {
  throw new Error();
}

//Buffer.from = (iterable, offset, length) => E.toUint8Array(iterable)

Buffer.from = function (iterable, offset, length) {
  if (typeof iterable == 'string') {
    var parsed = [];

    for (var c in iterable) {
      parsed[c] = iterable.charCodeAt(c);
    }

    return new Uint8Array(parsed);
  } else if (iterable instanceof ArrayBuffer) {
    return new Uint8Array(iterable.slice(offset !== undefined ? offset : 0, offset + (length !== undefined ? length : iterable.length)));
  } else if (iterable instanceof Array || iterable instanceof Uint8Array) {
    return new Uint8Array(iterable);
  } else {
    throw new TypeError('Cannot create buffer from', typeof iterable === 'undefined' ? 'undefined' : _typeof(iterable));
  }
};

Buffer.concat = function (_list, _totalLength) {
  var list = _list || [],
      totalLength = _totalLength !== undefined ? _totalLength : list.reduce(function (totalLength, array) {
    return totalLength + array.length;
  }, 0),
      buffer = Buffer.from([], 0, totalLength);

  list.reduce(function (offset, buf) {
    buffer.set(buf, offset);
    return offset + buf.length;
  }, 0);

  return buffer;
};

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

function BufferState() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Object.assign(this, {
    _buffer: [],
    length: 0
  }, options);
}

BufferState.prototype = {
  push: function push(chunk) {
    if (chunk.length) {
      var node = {
        chunk: Buffer.from(chunk),
        encoding: 'binary',
        next: null
      };

      if (this._buffer.length) {
        this._buffer[this._buffer.length - 1].next = node;
      }

      this._buffer.push(node);
      this.length += node.chunk.length;
    }

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

    var buffer = Buffer.from(Array(length));

    var offset = this._buffer.slice(0, to.nodeIndex).reduce(function (offset, node) {
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
      return Buffer.from([]);
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
    var buffer = Buffer.from(Array(length));
    // console.timeEnd('from')
    // console.time('offset')

    // console.timeEnd('buffer')

    var offset = this.nodes(1 + to.nodeIndex).reduce(function (offset, node) {
      buffer.set(node.chunk, offset);
      return offset + node.chunk.length;
    }, 0);
    // console.timeEnd('offset')
    if (offset < length) {
      var node = this.nodes(1)[0];

      buffer.set(node.chunk.slice(0, length - offset), offset);
      node.chunk = node.chunk.slice(length - offset);

      this.unshift(node.chunk);
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

var DEFAULT_HIGHWATERMARK = 64;
// const defaultWatcher = {
//   cache: {},
//   currentPattern: null,
//   arrayOffset: 0,
//   patternIndex: 0,
//   byteIndex: 0,
//   length: 0,
//   active: false
// }

function decrementActive() {
  if (! --this._busState.active) {
    this.emit('inactive');
  }
}

function _resetWatcher(watcher) {
  watcher.currentPattern = null;
  watcher.arrayOffset = watcher.patternIndex = watcher.byteIndex = watcher.length = 0;
  watcher.active = false;

  return watcher;

  // return Object.assign(watcher, defaultWatcher)
}

function _parse() {
  var _this = this;

  var _busState = this._busState,
      watching = _busState.watching,
      frame = _busState.frame,
      _buffer = _busState._buffer;


  if (!watching.length) {
    this.emit('error', {
      msg: 'Unexpected watching data',
      data: this._busState.buffer()
    });
    return;
  }

  if (this._busState.nodeIndex < 0) {
    this._busState.nodeIndex = 0;
  }

  for (; this._busState.nodeIndex < _buffer.length; this._busState.nodeIndex++) {
    var chunk = _buffer[this._busState.nodeIndex].chunk;

    var currentChunkIndex = 0;
    var watcherIndex = 0;
    var isEqual = false;
    for (; currentChunkIndex < chunk.length; currentChunkIndex++) {
      if (!this._busState.active) {
        this._busState.active = this._busState.watching.reduce(function (active, watcher) {
          var patterns = watcher.patterns;

          try {
            watcher.currentPattern = typeof patterns[0] == 'function' ? patterns[0](Buffer.from([])) : patterns[0], watcher.active = true;
            return active + 1;
          } catch (err) {
            _this.emit('error', err);
            return active;
          }
        }, 0);
      }

      var byte = chunk[currentChunkIndex];

      for (watcherIndex = 0; watcherIndex < watching.length; watcherIndex++, isEqual = false) {
        var watcher = watching[watcherIndex];

        if (!watcher.active) {
          continue;
        }

        var expected = watcher.currentPattern[watcher.byteIndex];

        // console.log('current watching:', watcher.currentPattern)
        // console.log('current chunk:', chunk)
        // console.log('byte:', byte)
        // console.log('expected:', expected)

        if (expected === undefined || expected === byte) {
          isEqual = true;
        } else if (Array.isArray(expected)) {
          if (watcher.arrayOffset <= 0 && expected[0] > 0) {
            watcher.arrayOffset = expected[0];
          }

          if (--watcher.arrayOffset > 0) {
            watcher.length++;
            continue;
          }

          isEqual = true;
        } else if (typeof expected == 'function') {
          try {
            isEqual = !!expected.call(this, byte, watcher.length, this._busState.slice(1 + watcher.length));
          } catch (err) {
            isEqual = false;
            this.emit('error', err);
          }
        }

        if (isEqual) {
          watcher.length++;

          if (++watcher.byteIndex >= watcher.currentPattern.length) {
            if (++watcher.patternIndex >= watcher.patterns.length) {
              // console.time( 'buffer' )
              // console.log(watcher.callback)
              var _chunk = this._busState.buffer(watcher.length);
              // console.timeEnd( 'buffer' )
              this._busState.nodeIndex = -1;
              try {
                // console.time( 'cb' )
                watcher.callback(_chunk,
                // frame.splice(-watcher.length),
                watcher.pattern);
                // console.timeEnd( 'cb' )
              } catch (err) {
                this.emit('error', err);
              }
              // this._busState.watching = []
              // console.time( 'reset' )
              watching.forEach(function (watcher) {
                _resetWatcher(watcher);
                decrementActive.call(_this);
              });
              // console.timeEnd( 'reset' )
            } else {
              // console.time('next pattern')
              var nextPattern = watcher.patterns[watcher.patternIndex];
              watcher.byteIndex = 0;

              try {
                if (typeof nextPattern == 'function') {
                  watcher.currentPattern = nextPattern.call(this, this._busState.slice(watcher.length));
                } else {
                  watcher.currentPattern = nextPattern;
                }
              } catch (err) {
                _resetWatcher(watcher);
                decrementActive.call(this);
                this.emit('error', err);
              }
              // console.timeEnd('next pattern')
            }
          }
        } else {
          _resetWatcher(watcher);
          decrementActive.call(this);

          if (!this._busState.active) {
            this.emit('error', {
              msg: 'Unparsed chunk',
              data: this._busState.buffer() // frame.splice(0)
            });
            //
            // if(!isChunkCorrupted) {
            //   isChunkCorrupted = true
            //   setImmediate(() => {
            //     isChunkCorrupted = false
            //     this.emit('error', {
            //       msg: 'Unparsed chunk',
            //       data: frame.splice(0)
            //     })
            //   })
            // }
          }
        }
      }
    }
  }

  if (this._busState.active) {
    this.emit('drain');
  }
}

function _Bus() {
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

_Bus.prototype = {
  setup: function setup() {
    if (this._busState.configured) {
      return Promise.reject('already configured');
    }

    this._busState.configured = true;
    return this._setup.apply(this, arguments);
  },
  push: function push(chunk) {
    var _this3 = this;

    if (chunk.length) {
      this._busState.push(chunk);

      if (!this._busState.ticker) {
        this._busState.ticker = true;
        setImmediate(function () {
          _this3._busState.ticker = false;
          _parse.call(_this3);
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
  watch: function watch(patterns, cb) {
    var watcher = _resetWatcher({
      patterns: patterns,
      callback: cb.bind(this)
    });

    this._busState.watching.push(watcher);

    return watcher;
  },
  unwatch: function unwatch(watcher) {
    if (watcher) {
      var index = this._busState.watching.indexOf(watcher);

      if (index >= 0) {
        this._busState.watching.splice(index, 1);
      }
    } else {
      this._busState.watching.splice(0);
    }

    return this;
  },


  /**
    @TODO Promise interface
  */

  rx: function rx(patterns) {
    var _this4 = this;

    var cb = void 0,
        options = {};

    if (typeof (arguments.length <= 1 ? undefined : arguments[1]) == 'function') {
      cb = arguments.length <= 1 ? undefined : arguments[1];
    } else if (typeof (arguments.length <= 2 ? undefined : arguments[2]) == 'function') {
      cb = arguments.length <= 2 ? undefined : arguments[2];
      Object.assign(options, arguments.length <= 1 ? undefined : arguments[1]);
    } else {
      throw new ReferenceError('Callback is not provided');
    }

    var watcher = void 0;
    var setWatcher = function setWatcher() {
      watcher = _this4.watch(patterns, cb);
      _this4._read(_this4.options.highWaterMark);
    };

    if ('timeout' in options) {
      setTimeout(setWatcher, options.timeout);
    } else {
      setWatcher();
    }

    return watcher;
  },
  tx: function tx(binary) {
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

var Bus = _extend({
  super: [_Bus, EventEmitter],
  apply: [_Bus, EventEmitter]
});

var preamble = [1, 2, 3];
var postamble = [4, function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  console.log(args);
  return true;
}, 6];

var bus = new Bus({
  read: function read() {},
  write: function write() {},
  setup: function setup() {}
});

bus.on('error', console.error);

bus.rx([preamble, postamble], console.log);

bus.push(preamble);

// // import Bus from 'bus'
// // import Schedule from 'schedule'
// import * as Blink from 'blink'
// import {
//   command,
//   ACK,
//   NACK,
//   INFO,
//   XINFO
// } from 'nfc'
// import Bus from 'nfc/bus'
// import {
//   PN532_I2C_ADDRESS,
//   PN532_COMMAND_SAMCONFIGURATION,
//   PN532_SAM_NORMAL_MODE,
//   PN532_COMMAND_WRITEGPIO,
//   PN532_COMMAND_INLISTPASSIVETARGET,
//   PN532_COMMAND_INDATAEXCHANGE,
//   PN532_COMMAND_GETFIRMWAREVERSION,
//   PN532_COMMAND_WAKEUP,
//   MIFARE_COMMAND_READ_16,
//   MIFARE_COMMAND_AUTH_A,
//   MIFARE_COMMAND_AUTH_B,
//   MIFARE_COMMAND_WRITE_4,
//   MIFARE_COMMAND_WRITE_16
// } from 'nfc/constants'
//
// import {
//   encodeMessage,
//   decodeMessage,
//   textRecord
// } from 'esp-ndef'
//
// // let usbConsole = true
// // let consoleBus = null
// // let log = ''
// //
// //
// // function toggleConsole() {
// //   usbConsole = !usbConsole
// //   if (usbConsole) {
// //     consoleBus = null
// //     USB.removeAllListeners()
// //   } else {
// //     consoleBus = new Bus({
// //       setup() {
// //         USB.on('data', data => {
// //           this.parse.call(this, data)
// //           USB.setup()
// //           // USB.write(Buffer.from(['!', ...[].slice.call(data, 0)]))
// //         })
// //       },
// //       read() {},
// //       write() {}
// //     })
// //
// //     consoleBus.rx([Buffer.from('/on')], () => {
// //       Blink.once(LED1)
// //       USB.write(JSON.stringify(consoleBus._busState))
// //       // toggleConsole()
// //     })
// //
// //     // consoleBus.rx([Buffer.from('/off')], () => {
// //     //   LED1.write(1)
// //     //   // USB.write('/off\r\n')
// //     //   // toggleConsole()
// //     // })
// //     //
// //     // consoleBus.on('error', err => {
// //     //   Blink.once(LED1, 200)
// //     // })
// //
// //     consoleBus.setup()
// //   }
// //
// //   usbConsole ?
// //     USB.setConsole(false) :
// //     LoopbackA.setConsole(false)
// // }
// //
// // toggleConsole()
//
// // setWatch( toggleConsole, BTN1, {
// //   repeat: true,
// //   edge: 'rising',
// //   debounce: 50
// // } )
// //
// // Blink.start( LED2 )
// //
// // const encoded = encodeMessage( [
// //   textRecord( '2enhello world!' )
// // ] )
// //
// // import fs from 'fs'
//
// const wakeup = command([PN532_COMMAND_WAKEUP])
// const sam = command([PN532_COMMAND_SAMCONFIGURATION, PN532_SAM_NORMAL_MODE, 20, 0])
//
// // [0, 0, 255, 0, 255, 0]
// // [0, 0, 255, 6, 250, 213, 3, 50, 1, 6, 7, 232, 0]
//
// // [0, 0, 255, 0, 255, 0, 2, 42, 1, 6, 7, 232, 0, 0, 0, ]
//
// // [1, 0, 0, 255, 0, 255, 0, 2, 42, 0, 0, 0, 0, 0, 0, 0]
// // [1, 0, 0, 255, 6, 250, 213, 3, 50, 1, 6, 7, 232, 0, 0, 0]
//
// function setup() {
//   if(this.type == 'serial') {
//     this.transport.setup(115200)
//
//     this.transport.write(wakeup)
//     this.transport.write(sam)
//
//     setTimeout(() => {
//       this.transport.on('data', data => this.push(data))
//       console.log('Bus has been set up')
//       Blink.once(LED1, 20, () => {
//         setTimeout(() => Blink.once(LED1, 20), 200)
//       })
//
//       this.rx([
//         ...ACK,
//         ...INFO
//       ], frame => {
//         console.log('frame')
//         console.log(frame)
//       })
//
//       this.tx(command([PN532_COMMAND_GETFIRMWAREVERSION]))
//     }, 500)
//   } else if (this.type == 'i2c') {
//     this.transport.setup({ bitrate: 400*1000 })
//
//     this.on('drain', () => {
//       this._read()
//     })
//
//     try {
//       this.tx(1)
//     } catch(err) {
//       console.log('Handled', err.msg)
//       console.log('Continue...')
//     }
//
//     this.tx(command([PN532_COMMAND_GETFIRMWAREVERSION]))
//
//     this.rx([
//       ...ACK,
//       ...INFO
//     ], { timeout: 10 }, frame => {
//       console.log('frame')
//       console.log(frame)
//     })
//   }
// }
//
// const bus = new Bus({
//   transport: Serial1,
//   type: 'serial',
//   setup,
//   read(length) {
//     if(this.type == 'i2c') {
//       while(true) {
//         if(this.transport.readFrom(PN532_I2C_ADDRESS, 1)[0]) {
//           const chunk = this.transport.readFrom(PN532_I2C_ADDRESS, 1 + length)
//           this.push(chunk)
//         } else {
//           break
//         }
//       }
//     } else if(this.type == 'serial') {
//       // const chunk = this.transport.read(length)
//       // this.push(chunk)
//     }
//   },
//   write(chunk) {
//     if(this.type == 'serial') {
//       this.transport.write(chunk)
//     } else if(this.type == 'i2c') {
//       this.transport.writeTo(PN532_I2C_ADDRESS, chunk)
//     }
//   },
//   highWaterMark: 16
// })
//
// bus.on('error', err => {
//   console.error('BusError:', err)
// })
//
// bus.setup()
//
// // const key = new Uint8  Array(Array(6).fill(0xff))
//
// // console.log(key)
//
//
// // setTimeout(() => {
// //   (function poll() {
// //     // console.log(process.memory().free)
// //     // console.log(bus._busState.watching.length)
// //     Promise.resolve()
// //       .then(() => bus.findTargets(1, 'A')) // .then(data => { console.log('found card', data.uid); return data })
// //       .then(data => {
// //         LED1.write(0)
// //         return data
// //       })
// //       // .then(data => bus.authenticate(4, data.uid, key).then(data => { console.log('auth op 4:', data) }).then(() => bus.authenticate(3, data.uid, key).then(data => { console.log('auth op:', data) })))
// //       .then(data => bus.authenticate(1 * 4, data.uid, key)) // .then(data => { console.log('auth', data) })
// //       // .then(data => bus.writeBlock(4, [1, 3, 6, 4])).then(data => { console.log('write op:', data) })
// //       // .then(data => { console.time('reading 2 sector'); return data })
// //       .then(data => bus.readSector(1))
// //       .then(data => {
// //         LED1.write(1)
// //         return data
// //       }) // .then(data => { console.log('sector 2:', data); return data })
// //       .then(data => data.reduce((buffer, data) => [...buffer, ...[].slice.call(data.chunk, 0)], []))
// //       .then(console.log)
// //       // .then(data => { console.timeEnd('reading 2 sector'); return data })
// //       // .then(data => bus.readBlock(4)).then(data => { console.log('block 4:', data) })
// //       // .then(data => bus.readBlock(5)).then(data => { console.log('block 5:', data) })
// //       // .then(data => bus.readBlock(6)).then(data => { console.log('block 6:', data) })
// //       // .then(data => bus.readBlock(7)).then(data => { console.log('block 7:', data) })
// //       .catch(err => {
// //         LED1.write(1)
// //         console.error('Error:', err)
// //       })
// //       .then(() => {
// //         setTimeout(() => {
// //           poll()
// //         }, 500)
// //       })
// //   })()
// // }, 1000)
