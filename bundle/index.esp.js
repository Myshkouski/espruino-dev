'use strict';

var timers = {};

function time(label) {
  timers[label] = Date.now();
}

function timeEnd(label) {
  if (label in timers) {
    console.log(label + ': ' + (Date.now() - timers[label]).toFixed(3) + 'ms');
    delete timers[label];
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
        defProp(Extended, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        });
      }
    }
  }

  Object.defineProperty(Extended, 'prototype', { value: {} });
  Object.defineProperty(Extended.prototype, 'constructor', { value: Child });
  Object.defineProperty(Extended.prototype, PROTOTYPE_IS_EXTENDED_PROP, { value: true });

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

function EventEmitter() {
  this._listeners = {};
}

_named('EventEmitter', EventEmitter);

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

function Schedule() {
  this.pending = Promise.resolve(null);
}

Schedule.prototype = {
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

// import { Writable } from 'stream'
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
          setTimeout(function () {
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
        setTimeout(function () {
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
  setTimeout(function () {
    led.write(false);
    cb && cb();
  }, on);
};

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

var PN532_PREAMBLE = data$2.PN532_PREAMBLE;
var PN532_STARTCODE1 = data$2.PN532_STARTCODE1;
var PN532_STARTCODE2 = data$2.PN532_STARTCODE2;
var PN532_POSTAMBLE = data$2.PN532_POSTAMBLE;
var PN532_HOST_TO_PN532 = data$2.PN532_HOST_TO_PN532;
var PN532_PN532_TO_HOST = data$2.PN532_PN532_TO_HOST;









var PN532_COMMAND_SAMCONFIGURATION = data$2.PN532_COMMAND_SAMCONFIGURATION;





var PN532_COMMAND_INLISTPASSIVETARGET = data$2.PN532_COMMAND_INLISTPASSIVETARGET;


var PN532_COMMAND_INDATAEXCHANGE = data$2.PN532_COMMAND_INDATAEXCHANGE;













var PN532_WAKEUP = data$2.PN532_WAKEUP;










var MIFARE_CMD_AUTH_A = data$2.MIFARE_CMD_AUTH_A;

var MIFARE_CMD_READ = data$2.MIFARE_CMD_READ;
var MIFARE_CMD_WRITE_4 = data$2.MIFARE_CMD_WRITE_4;
















































var PN532_SAM_NORMAL_MODE = data$2.PN532_SAM_NORMAL_MODE;

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

var INFO = [[PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, undefined, LCS_std, PN532_PN532_TO_HOST], BODY_std, [CHECKSUM_std, PN532_POSTAMBLE]];





var ACK = [new Uint8ClampedArray([PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x00, 0xff, PN532_POSTAMBLE])];



var command = function command(_command) {
  return new Uint8ClampedArray([PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0xff & _command.length + 1, 0xff & ~_command.length, PN532_HOST_TO_PN532].concat(_command, [
  // checksum
  ~(0xff & _command.reduce(function (checksum, byte) {
    return checksum += byte;
  }, 1 /** include PN532_HOST_TO_PN532 1 byte to length */)), PN532_POSTAMBLE]));
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

var data$4 = { TNF_EMPTY: 0,
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
    tnf = data$4.TNF_EMPTY;
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
  if (tnf == data$4.TNF_WELL_KNOWN) {
    if (type == data$4.RTD_TEXT) {
      value = decode(payload);
    } else if (type == data$4.RTD_URI) {
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
  return record(data$4.TNF_WELL_KNOWN, data$4.RTD_TEXT, id || [], encode(text, languageCode));
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

  setTimeout(function () {
    Serial1.read();
    Serial1.pipe(_this);
  }, 1500);

  setTimeout(function () {
    blink.once(LED1, 20, function () {
      return setTimeout(function () {
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

    bus.rx(ACK, function () {
      console.log('ACK');
    });

    bus.rx(INFO, function (frame) {
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

    bus.rx(ACK, function (ACK$$1) {});

    bus.rx(ERR, fail);

    bus.rx(INFO, function (frame) {
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

    bus.rx(ACK, function (ACK$$1) {});

    bus.rx(ERR, fail);

    bus.rx(INFO, function (block) {
      console.log('WRITE SUCCEED');

      done();
    });

    Serial1.write(WRITE);
  });

  bus.deferred(function (done, fail) {
    var READ = command([PN532_COMMAND_INDATAEXCHANGE, 1, MIFARE_CMD_READ, block]);

    bus.rx(ACK, function (ACK$$1) {});

    bus.rx(ERR, fail);

    bus.rx(INFO, function (block) {
      console.log("RED", block);

      done();
    });

    Serial1.write(READ);
  });

  bus.deferred(function (done) {
    setTimeout(function () {
      console.log(process.memory().free);
      done();
      poll();
    }, 1000);
  });
})();
