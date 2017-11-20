'use strict';

const defProp = (obj, prop, desc) => {
  try {
    Object.defineProperty(obj, prop, desc);
    return obj
  } catch(e) {
    if(desc.get)
      obj.value = desc.get();
    else if(desc.value)
      obj[prop] = desc.value;

    return obj
  }
};

var _named = (name, f) => {
  defProp(f, 'name', { value: name });
  //defProp(f, 'toString', { value: () => '[Function' + (f.name !== undefined ? ': ' + f.name : '') + ']' })

  return f
};

const SUPER_CHAIN_PROTO_PROP = '_super';
const SUPER_CHAIN_APPLY_PROP = '_apply';
const PROTOTYPE_IS_EXTENDED_PROP = '_isExtended';

const _copyChain = (Extended, ProtoChain, chainPropName, ignoreExtended) => {
  //if chain on [Extended] has not been created yet
  if(!Extended.prototype[chainPropName])
    defProp(Extended.prototype, chainPropName, { value: [] });

  ProtoChain.forEach(Proto => {
    //console.log(!!Proto.prototype['__extended__'], Proto)
    //if [Proto] has been '__extended__' and has same-named proto chain, copy the Proto chain to Extended chain
    const isExtended = !!Proto.prototype[PROTOTYPE_IS_EXTENDED_PROP],
      hasSameChain = !!Proto.prototype[chainPropName];

    const alreadyInChain = Extended.prototype[chainPropName].some(P => (P === Proto)),
      shouldBePushed = (!isExtended || !ignoreExtended) && !alreadyInChain,
      shouldCopyChain = isExtended && hasSameChain;

    if(shouldCopyChain)
      Proto.prototype[chainPropName].forEach(Proto => {
        //avoid pushing twice
        if(!Extended.prototype[chainPropName].some(P => (P === Proto)) ) {
          //console.log('pushed', Proto)
          Extended.prototype[chainPropName].push(Proto);
        }
      });

    if(shouldBePushed)
      Extended.prototype[chainPropName].push(Proto);
  });

  //console.log(Extended.prototype[chainPropName])
};

const _extend = (options = {}) => {
  if(!options.apply)
    options.apply = [];
  if(!options.super)
    options.super = [];
  if(!options.static)
    options.static = [];

  const Child = options.super[0];

  if(!options.name)
    options.name = Child.name;

  function Extended() {
    Extended.prototype[SUPER_CHAIN_APPLY_PROP].forEach(Super => {
      if(Super !== Extended) {
        Super.apply(this, arguments);
      }
    });
  }

  _named(options.name, Extended);

  for(let i in options.static) {
    for(let prop in options.static[i]) {
      if('prototype' != prop) {
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

  for(let i in options.super) {
    function Proto() {}
    Proto.prototype = options.super[i].prototype;
    const proto = new Proto();

    for(let prop in proto) {
      if(['constructor', PROTOTYPE_IS_EXTENDED_PROP, SUPER_CHAIN_PROTO_PROP, SUPER_CHAIN_APPLY_PROP].indexOf(prop) < 0) {
        defProp(Extended.prototype, prop, {
          value: proto[prop],
          enumerable: true,
          writable: true
        });
      }
    }
  }

  _copyChain(Extended, options.super, SUPER_CHAIN_PROTO_PROP, false);
  _copyChain(Extended, options.apply, SUPER_CHAIN_APPLY_PROP, true);

  return Extended
};

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

function _Stream(options = {}) {
	this.options = {
		highWaterMark: options.highWaterMark || 128
	};
}

const Stream = _extend({
	name: 'Stream',
	super: [events],
	apply: [events, _named('Stream', _Stream)]
});

Stream.prototype.emit = function (event, err) {
	if(event === 'error' && !(this['#onerror'] || this._events['error']))
		throw new Error(err)

	return events.prototype.emit.apply(this, arguments)
};

function BufferState(options = {}) {
  Object.assign(this, {
		_buffer: [],
		length: 0
	}, options);
}

BufferState.prototype = {
  push(chunk) {
    const node = {
  		chunk: Buffer.from(chunk),
  		next: null
  	};

    if(this._buffer.length) {
      this._buffer[this._buffer.length - 1].next = node;
    }

    this._buffer.push(node);
    this.length += node.chunk.length;

    return this.length
  },

  unshift(chunk) {
    const node = {
  		chunk: Buffer.from(chunk),
      encoding: 'binary',
  		next: null
  	};

    if(this._buffer.length) {
      node.next = this._buffer[0];
    }

    this._buffer.unshift(node);
    this.length += node.chunk.length;

    return this.length
  },

  nodes(count) {
    const nodes = this._buffer.splice(0, count);
    nodes.forEach(node => this.length -= node.chunk.length);

    return nodes
  },

  at(index) {
    if(index >= this.length || index < 0) {
      return
    }

    for(let nodeIndex = 0; nodeIndex < this._buffer.length; nodeIndex ++) {
      if(index < this._buffer[nodeIndex].chunk.length) {
        return {
          index,
          nodeIndex
        }
      }

      index -= this._buffer[nodeIndex].chunk.length;
    }
  },

  buffer(length) {
    if(length === undefined) {
      length = this.length;
    }

    if(!this.length) {
      return Buffer.from([])
    }

    if(length > this.length) {
      length = this.length;
    }

    let to;

    if(length) {
      to = this.at(length);
    }

    if(!to) {
      to = {
        index: this.length - 1,
        nodeIndex: this._buffer.length - 1
      };
    }

    const buffer = Buffer.from([], 0, length);

    const offset = this.nodes(to.nodeIndex).reduce((offset, node) => {
      buffer.set(node.chunk, offset);
      return offset += node.chunk.length
    }, 0);

    if(offset < length) {
      const node = this.nodes(1).shift();

      buffer.set(node.chunk.slice(0, length - offset), offset);
      node.chunk = node.chunk.slice(length - offset);

      this.unshift(node);
    }

    return buffer

    // return from.nodeIndex == to.nodeIndex
    //   ? this._buffer[from.nodeIndex].chunk.slice(from.index, to.index)
    //   : Buffer.concat([
    //       this._buffer[from.nodeIndex].chunk.slice(from.index),
    //       ...this._buffer.slice(1 + from.nodeIndex, to.nodeIndex).map(node => node.chunk),
    //       this._buffer[to.nodeIndex].chunk.slice(0, to.index)
    //     ])
  }
};

const encodings = {
	BINARY: 'binary',
	UTF8: 'utf8'
};

function toString(binary) {
	let str = '';
	for(let i = 0; i < binary.length; i++)
		str += String.fromCharCode(binary[i]);
	return str
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
	if(this._readableState.flowing) {
		// _broadcast.call(this)
		let chunk = this.read();
		if(chunk && chunk.length) {
			process.nextTick(() => {
				if(this._readableState.defaultEncoding == encodings.UTF8) {
					chunk = toString(chunk);
				}
				this.emit('data', chunk, this._readableState.defaultEncoding);
			});
		}
	}
}

function _end() {
	this._readableState.flowing = null;
	this._readableState.ended = true;

}

function _Readable(options = {}) {
	this._readableState = new BufferState({
		flowing: null,
		ended: false,
		defaultEncoding: encodings.BINARY
	});

	this.pipes = [];

	this._read = options.read.bind(this);

	if(!this._read)
		throw new TypeError('_read() is not implemented')
	if(!this._read instanceof Function)
		throw new TypeError('\'options.read\' should be a function, passed', typeof options.read)
}

_Readable.prototype = {
	pause() {
		//console.log('pause()')
		if(this._readableState.flowing !== false) {
			this._readableState.flowing = false;
			this.emit('pause');
		}

		return this
	},

	resume() {
		if(!this._readableState.flowing) {
			this._readableState.flowing = true;
			this.emit('resume');
			_flow.call(this);
		}

		return this
	},

	read(length) {
		if(length < 0) {
			throw new Error('"length" must be more than 0')
		}

		if(!this._readableState.ended) {
			if(length === undefined) {
				if(this._readableState.length < this.options.highWaterMark) {
					this._read(this.options.highWaterMark - this._readableState.length);
				}
			} else if(length > this._readableState.length) {
		 		this._read(length - this._readableState.length);
		 	}
		}

		if(this._readableState.ended) {
			if(this._readableState.length) {
				return this._readableState.buffer()
			}

			return null
		}

		if(length !== undefined && this._readableState.length < length) {
			return null
		}

		return this._readableState.buffer(length)
	},

	push(chunk) {
		//console.log('push(' + chunk + ')')
		if(chunk === null) {
			_end.call(this);
			return false
		}

		const overflow = this._readableState.push(chunk) > this.options.highWaterMark;

		if(!overflow)
			_flow.call(this);

		return !overflow
	},

	pipe(writable) {
		if(!this.pipes.some(pipe => { pipe.writable === writable; }) ) {
			const listener = (data, pipe) => {
				if(!writable.write(data)) {
					pipe.stopped = true;
					this.pause();

					writable.once('drain', () => { this.resume(); });
				}
			};

			const pipe = { writable, listener, stopped: undefined };

			this
				.on('data', data => { listener(data, pipe); })
				.pipes.push(pipe);

			if(writable instanceof Stream)
				writable.emit('pipe');
		}

		return writable
	},

	unpipe(writable) {
	  if(writable) {
	    const pipe = this.pipes.find(pipe => { pipe.writable === writable; });

	    if(pipe)
	      this.removeListener('data', pipe.listener);
	  }

	  else {
	    for(let index in this.pipes)
	      this.removeListener(this.pipes[index].listener);
	    this.pipes.splice(0);
	  }
	},

	on(event, listener) {
		if(event == 'data')
			this.resume();

		return Stream.prototype.on.apply(this, arguments)
	},

	removeListener(event, listener) {
		if(event == 'data') {
			//@TODO !!! this._listeners should be implemented
			//console.log(this.listeners)
			this.pause();
		}

		return Stream.prototype.removeListener.apply(this, arguments)
	},

	isPaused() {
		return !this._readableState.flowing
	}
};

const Readable = _extend({
	name: 'Readable',
	super: [Stream, _Readable],
	apply: [Stream, _named('Readable', _Readable)]
});

function _readFromInternalBuffer(...args) {
  const spliced = this._writableState.nodes(...args);

  if(this._writableState.needDrain && (this._writableState.length < this.options.highWaterMark)) {
    this._writableState.needDrain = false;
    this.emit('drain');
  }

  return spliced
}

function _flush() {
  const { _writableState } = this;

  if(_writableState.corked)
    return

  if(!_writableState.length) {
    if(_writableState.ended)
      this.emit('finish');

    return
  }

  const cb = err => {
    if(err)
      this.emit('error', err);

    _writableState.consumed = true;

    process.nextTick(() => {
      _flush.call(this);
    });
  };

  if(!_writableState.corked && _writableState.consumed) {
    _writableState.consumed = false;

    if(this._writev) {
      const nodes = _readFromInternalBuffer.call(this);

      this._writev(nodes, cb);
    } else {
      const node = _readFromInternalBuffer.call(this, 1)[0];

      this._write(node.chunk, node.encoding, cb);
    }
  }
}

function _Writable(options = {}) {
	this._write = options.write.bind(this);

  this._writableState = new BufferState({
    getBuffer: () => this._writableState._buffer,

    corked: 0,
    consumed: true,
    needDrain: false,
    ended: false,
    decodeStrings: true
  });
}

_Writable.prototype = {
  write(chunk/*, encoding*/) {
    const { _writableState } = this;

    if(_writableState.ended)
      throw new Error('Write after end')

    this._writableState.push(chunk);

    _flush.call(this);

    return _writableState.length < this.options.highWaterMark
  },

  end() {
    this.write.apply(this, arguments);
    this._writableState.ended = true;
    return this
  },

  cork() {
    this._writableState.corked++;
  },

  uncork() {
    if(this._writableState.corked > 0) {
      this._writableState.corked--;
      _flush.call(this);
    }
  }
};

const Writable = _extend({
	name: 'Writable',
  super: [Stream, _Writable],
  apply: [Stream, _named('Writable', _Writable)]
});

function _Duplex(options = {}) {}

const Duplex = _extend({
	name: 'Duplex',
  super: [Readable, Writable],
  apply: [Readable, Writable, _named('Duplex', _Duplex)]
});

Duplex.prototype.on = function on() {
  Readable.prototype.on.apply(this, arguments);
  //Writable.prototype.on.apply(this, arguments)

  return this
};

function _Duplex$1(options = {}) {}

const Duplex$2 = _extend({
	name: 'Duplex',
  super: [Readable, Writable],
  apply: [Readable, Writable, _named('Duplex', _Duplex$1)]
});

Duplex$2.prototype.on = function on() {
  Readable.prototype.on.apply(this, arguments);
  //Writable.prototype.on.apply(this, arguments)

  return this
};

function _read(size) {
  //console.log('_read()')
  //dumb function
}

function _Transform(options = {}) {
  Duplex$2.call(this, Object.assign({}, options, {
    read: _read,
    write: options.transform
  }));
}

const Transform = _extend({
	name: 'Transform',
  super: [Duplex$2],
  apply: [_named('Transform', _Transform)]
});

function _transform(data, encoding, cb) {
  this.push(data, encoding);
  cb();
}

function _PassThrough(options = {}) {
  Transform.call(this, Object.assign({}, options, {
    transform: _transform
  }));
}

const PassThrough = _extend({
  name: 'PassThrough',
  super: [Transform],
  apply: [_PassThrough]
});

function _Schedule() {
  this.pending = Promise.resolve(null);
}

_Schedule.prototype = {
  immediate(task) {
    this.pending = Promise.all([
      this.pending,
      new Promise((done, fail) => {
        task(done, fail);
      }).catch(err => this.emit('error', err))
    ]);

    return this
  },

  deferred(task) {
    this.pending = this.pending
      .then(r => new Promise((done, fail) => {
        task(done, fail);
      }))
      .catch(err => this.emit('error', err));

    return this
  }
};

const Schedule = _extend({
  name: 'Schedule',
  super: [events, _named('Schedule', _Schedule)],
  apply: [events, _named('Schedule', _Schedule)]
});

function series(arr, cb, done) {
  let i = 0;(function next(res) {
    if (res !== undefined || i >= arr.length) {
      done && done(res);
    }
    else {
      setImmediate(() => cb(next, arr[i], i++, arr));
    }
  })();
}

function _parse(chunk, encoding, cb) {
  const { incoming, watching, frame } = this._busState;

  let currentChunkIndex = 0,
      currentIncomingWatcherIndex = 0,
      incomingIndex = 0,
      isEqual = false;

  if(!watching.length) {
    this.emit('error', new Error({
      msg: 'Unexpected incoming data',
      data: chunk
    }));
  }
  else {
    for(;currentChunkIndex < chunk.length; currentChunkIndex ++) {
      frame.push(chunk[currentChunkIndex]);

      if(!incoming.length) {
        for(let watchingIndex in watching) {
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
          } catch(err) {
            this.emit('error', err);
          }
        }
      }

      for(incomingIndex = 0; incomingIndex < incoming.length;) {
        const incomingI = incoming[incomingIndex],
              expected = incomingI.currentPattern[incomingI.byteIndex];

        if(expected === undefined || expected === chunk[currentChunkIndex]) {
          isEqual = true;

          incomingI.byteIndex ++;
        }
        else if(expected instanceof Array) {
          isEqual = true;

          if(incomingI.arrayOffset <= 0 && expected[0] > 0) {
            incomingI.arrayOffset = expected[0];
          }

          if(--incomingI.arrayOffset > 0) {
            continue
          }
          else {
            incomingI.byteIndex ++;
          }
        }
        else if(expected instanceof Function) {
          try {
            isEqual = !!expected.call(this, chunk[currentChunkIndex], incomingI.length, frame.slice(-incomingI.length - 1));
            incomingI.byteIndex ++;
          } catch(err) {
            this.emit('error', err);
            isEqual = false;
          }
        }
        else {
          isEqual = false;
        }

        if(isEqual) {
          incomingI.length ++;

          if(incomingI.byteIndex >= incomingI.currentPattern.length) {
            if(++ incomingI.patternIndex >= incomingI.patterns.length) {
              try {
                incomingI.callback.call(
                  this,
                  frame.splice(-incomingI.length),
                  incomingI.pattern
                );
              } catch(err) {
                this.emit('error', err);
              }

              incoming.splice(0);
              //break
            }
            else {
              const nextPattern = incomingI.patterns[incomingI.patternIndex];
              incomingI.byteIndex = 0;
              try {
                if(nextPattern instanceof Function) {
                  incomingI.currentPattern = nextPattern(frame.slice(-incomingI.length));
                }
                else {
                  incomingI.currentPattern = nextPattern;
                }
                incomingIndex ++;
              } catch(err) {
                this.emit('error', err);
                incoming.splice(incomingIndex, 1);
              }
            }
          }
          else {
            incomingIndex ++;
          }
        }
        else {
          incoming.splice(incomingIndex, 1);
        }
      }

      if(!incoming.length && frame.length) {
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
  const highWaterMark = this.options.highWaterMark;

  if(chunk.length > highWaterMark) {
    const chunks = [];
    for(let bytesLeft = chunk.length, offset = 0; bytesLeft > 0; bytesLeft -= highWaterMark) {
      const subchunk = chunk.slice(offset, offset += highWaterMark);
      chunks.push(next => _parse.call(this, subchunk, encoding, next));
    }

    series(chunks, cb);
  }
  else {
    _parse.apply(this, arguments);
  }
}

function _Bus(options = {}) {
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
  setup (...args) {
    return this.deferred(slots => {
      if(this._busState.configured)
        return Promise.reject('already configured')

      this._busState.configured = true;
      return this._setup(slots, ...args)
    })
  },

  watch (patterns, callback) {
    const watcher = {
      patterns,
      callback
    };

    this._busState.watching.push(watcher);

    return watcher
  },

  unwatch (watcher) {
    if(watcher) {
      const index = this._busState.watching.indexOf(watcher);

      if(index >= 0)
        this._busState.watching.splice(index, 1);
    } else {
      this._busState.watching.splice(0);
    }

    return this
  },

  /**
    * @TODO - Proper unwatch(): delete all previously RXed watchers
    */
  rx(patterns, cb) {
    const watcher = this.watch(patterns, frame => {
      //this.unwatch(watcher)
      const index = this._busState.watching.indexOf(watcher);

      if(index >= 0)
        this._busState.watching.splice(0, index + 1);

      cb(frame);
    });

    return this
  },

  tx(binary, options = {}) {
    return this.deferred(() => {
      console.log('tx');
      if('timeout' in options) {
        return new Promise((done, fail) => {
          setTimeout(() => {
            this.write(binary);
            done();
          }, options.timeout);
        })
      }

      this.write(binary);

      return Promise.resolve()
    })
  },

  reset () {
    this._busState.frame.splice(0);
    this._busState.incoming.splice(0);
    return this
  }
};

const Bus = _extend({
  name: 'Bus',
  super: [Writable, Schedule, _Bus],
  apply: [_Bus, Schedule]
});

let status = false;
function blink(mode) {
  if(mode === undefined)
    mode = !status;

  !mode
    ? blink.stop()
    : blink.start();

  return !!status
}

blink.start = () => {
  if(!status) {
    status = true;

    blink.once(LED2, 20, function cb() {
      if(status) {
        setTimeout(() => blink.once(LED2, 20, cb), 980);
      }
    });
  }
};

blink.stop = () => {
  if(status) {
    status = false;
  }
};

blink.once = (led, on = 20, cb) => {
  led.write(true);
  setTimeout(() => {
    led.write(false);
    cb && cb();
  }, on);
};

var data = { PN532_PREAMBLE:0,
  PN532_STARTCODE1:0,
  PN532_STARTCODE2:255,
  PN532_POSTAMBLE:0,
  PN532_HOST_TO_PN532:212,
  PN532_PN532_TO_HOST:213,
  PN532_COMMAND_DIAGNOSE:0,
  PN532_COMMAND_GETFIRMWAREVERSION:2,
  PN532_COMMAND_GETGENERALSTATUS:4,
  PN532_COMMAND_READREGISTER:6,
  PN532_COMMAND_WRITEREGISTER:8,
  PN532_COMMAND_READGPIO:12,
  PN532_COMMAND_WRITEGPIO:14,
  PN532_COMMAND_SETSERIALBAUDRATE:16,
  PN532_COMMAND_SETPARAMETERS:18,
  PN532_COMMAND_SAMCONFIGURATION:20,
  PN532_COMMAND_POWERDOWN:22,
  PN532_COMMAND_RFCONFIGURATION:50,
  PN532_COMMAND_RFREGULATIONTEST:88,
  PN532_COMMAND_INJUMPFORDEP:86,
  PN532_COMMAND_INJUMPFORPSL:70,
  PN532_COMMAND_INLISTPASSIVETARGET:74,
  PN532_COMMAND_INATR:80,
  PN532_COMMAND_INPSL:78,
  PN532_COMMAND_INDATAEXCHANGE:64,
  PN532_COMMAND_INCOMMUNICATETHRU:66,
  PN532_COMMAND_INDESELECT:68,
  PN532_COMMAND_INRELEASE:82,
  PN532_COMMAND_INSELECT:84,
  PN532_COMMAND_INAUTOPOLL:96,
  PN532_COMMAND_TGINITASTARGET:140,
  PN532_COMMAND_TGSETGENERALBYTES:146,
  PN532_COMMAND_TGGETDATA:134,
  PN532_COMMAND_TGSETDATA:142,
  PN532_COMMAND_TGSETMETADATA:148,
  PN532_COMMAND_TGGETINITIATORCOMMAND:136,
  PN532_COMMAND_TGRESPONSETOINITIATOR:144,
  PN532_COMMAND_TGGETTARGETSTATUS:138,
  PN532_WAKEUP:85,
  PN532_SPI_STATREAD:2,
  PN532_SPI_DATAWRITE:1,
  PN532_SPI_DATAREAD:3,
  PN532_SPI_READY:1,
  PN532_I2C_ADDRESS:36,
  PN532_I2C_READBIT:1,
  PN532_I2C_BUSY:0,
  PN532_I2C_READY:1,
  PN532_I2C_READYTIMEOUT:20,
  PN532_MIFARE_ISO14443A:0,
  MIFARE_CMD_AUTH_A:96,
  MIFARE_CMD_AUTH_B:97,
  MIFARE_CMD_READ:48,
  MIFARE_CMD_WRITE_4:162,
  MIFARE_CMD_WRITE_16:160,
  MIFARE_CMD_TRANSFER:176,
  MIFARE_CMD_DECREMENT:192,
  MIFARE_CMD_INCREMENT:193,
  MIFARE_CMD_RESTORE:194,
  NDEF_URIPREFIX_NONE:0,
  NDEF_URIPREFIX_HTTP_WWWDOT:1,
  NDEF_URIPREFIX_HTTPS_WWWDOT:2,
  NDEF_URIPREFIX_HTTP:3,
  NDEF_URIPREFIX_HTTPS:4,
  NDEF_URIPREFIX_TEL:5,
  NDEF_URIPREFIX_MAILTO:6,
  NDEF_URIPREFIX_FTP_ANONAT:7,
  NDEF_URIPREFIX_FTP_FTPDOT:8,
  NDEF_URIPREFIX_FTPS:9,
  NDEF_URIPREFIX_SFTP:10,
  NDEF_URIPREFIX_SMB:11,
  NDEF_URIPREFIX_NFS:12,
  NDEF_URIPREFIX_FTP:13,
  NDEF_URIPREFIX_DAV:14,
  NDEF_URIPREFIX_NEWS:15,
  NDEF_URIPREFIX_TELNET:16,
  NDEF_URIPREFIX_IMAP:17,
  NDEF_URIPREFIX_RTSP:18,
  NDEF_URIPREFIX_URN:19,
  NDEF_URIPREFIX_POP:20,
  NDEF_URIPREFIX_SIP:21,
  NDEF_URIPREFIX_SIPS:22,
  NDEF_URIPREFIX_TFTP:23,
  NDEF_URIPREFIX_BTSPP:24,
  NDEF_URIPREFIX_BTL2CAP:25,
  NDEF_URIPREFIX_BTGOEP:26,
  NDEF_URIPREFIX_TCPOBEX:27,
  NDEF_URIPREFIX_IRDAOBEX:28,
  NDEF_URIPREFIX_FILE:29,
  NDEF_URIPREFIX_URN_EPC_ID:30,
  NDEF_URIPREFIX_URN_EPC_TAG:31,
  NDEF_URIPREFIX_URN_EPC_PAT:32,
  NDEF_URIPREFIX_URN_EPC_RAW:33,
  NDEF_URIPREFIX_URN_EPC:34,
  NDEF_URIPREFIX_URN_NFC:35,
  PN532_GPIO_VALIDATIONBIT:128,
  PN532_GPIO_P30:0,
  PN532_GPIO_P31:1,
  PN532_GPIO_P32:2,
  PN532_GPIO_P33:3,
  PN532_GPIO_P34:4,
  PN532_GPIO_P35:5,
  PN532_SAM_NORMAL_MODE:1,
  PN532_SAM_VIRTUAL_CARD:2,
  PN532_SAM_WIRED_CARD:3,
  PN532_SAM_DUAL_CARD:4,
  PN532_BRTY_ISO14443A:0,
  PN532_BRTY_ISO14443B:3,
  PN532_BRTY_212KBPS:1,
  PN532_BRTY_424KBPS:2,
  PN532_BRTY_JEWEL:4,
  NFC_WAIT_TIME:30,
  NFC_CMD_BUF_LEN:64,
  NFC_FRAME_ID_INDEX:6 };

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

const check = values => 0x00 == 0xff & values.reduce((sum, value) => sum += value, 0x00);

const LCS_std = (byte, length, frame) => check(frame.slice(-2));

const CHECKSUM_std = (byte, length, frame) => check(frame.slice(5));

const BODY_std = frame => {
  const arr = [];
  for(let i = 0; i < frame[3] - 1; i ++)
    arr.push(undefined);
  return arr
};

const info = [
  [PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, undefined, LCS_std, PN532_PN532_TO_HOST],
  BODY_std,
  [CHECKSUM_std, PN532_POSTAMBLE]
];



const err = [
  [PN532_PREAMBLE, PN532_STARTCODE1 , PN532_STARTCODE2, 0x01, 0xff, undefined, CHECKSUM_std, PN532_POSTAMBLE]
];

const ack = [
  new Uint8ClampedArray([PN532_PREAMBLE, PN532_STARTCODE1, PN532_STARTCODE2, 0x00, 0xff, PN532_POSTAMBLE])
];




const command = command =>
  new Uint8ClampedArray([
    PN532_PREAMBLE,
    PN532_STARTCODE1,
    PN532_STARTCODE2,
    0xff & (command.length + 1),
    0xff & (~command.length),
    PN532_HOST_TO_PN532,
    ...command,
    // checksum
    ~(0xff & command.reduce((checksum, byte) => checksum += byte, 1 /** include PN532_HOST_TO_PN532 1 byte to length */)),
    PN532_POSTAMBLE
  ]);

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

const encoded = encodeMessage([
  textRecord('2enhello world!')
]);

const wakeup = command([PN532_WAKEUP]);
const sam = command([PN532_COMMAND_SAMCONFIGURATION, PN532_SAM_NORMAL_MODE, 20, 0]);




function setup(done) {
  Serial1.setup(115200, {
    rx: B7, tx: B6
  });

  Serial1.write(wakeup);
  Serial1.write(sam);

  setTimeout(() => {
    Serial1.read();
    Serial1.pipe(this);
  }, 1500);

  setTimeout(() => {
    blink.once(LED1, 20, () => setTimeout(() => blink.once(LED1, 20), 200));

    done();
  }, 2000);
}

const bus = new Bus({
  setup, highWaterMark: 64
});

bus.on('error', console.error);

bus.setup(Serial1);

const KEY = new Uint8ClampedArray([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

(function poll() {
  let uid,
      block = 4;

  bus.deferred(done => {
    const LIST = command([
      PN532_COMMAND_INLISTPASSIVETARGET,
      1,
      0
    ]);

    bus.rx(ack, () => {
      console.log('ACK');
    });

    bus.rx(info, frame => {
      const body = frame.slice(7, 5 + frame[3]),
            uidLength = body[5],
            _uid = body.slice(6, 6 + uidLength);

      console.log('FOUND', {
        code: frame[6],
        body,
        count: body[0],
        ATQA: body.slice(2, 4), // SENS_RES
        SAK: body[4],
        uidLength,
        uid: _uid
      }['ATQA']);

      uid = _uid;

      done();
    });

    Serial1.write(LIST);
  });

  bus.deferred((done, fail) => {
    const AUTH = command([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_AUTH_A,
      block
    ].concat(KEY).concat(uid));

    bus.rx(ack, ack$$1 => {});

    bus.rx(err, fail);

    bus.rx(info, frame => {
      console.log('AUTH SUCCEED'/*, {
        code: frame[6],
        body: frame.slice(7, 5 + frame[3])
      }*/);

      done();
    });

    Serial1.write(AUTH);
  });

  bus.deferred((done, fail) => {
    const WRITE = command([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_WRITE_4,
      block
    ].concat(encoded));

    bus.rx(ack, ack$$1 => {});

    bus.rx(err, fail);

    bus.rx(info, block => {
      console.log('WRITE SUCCEED');

      done();
    });

    Serial1.write(WRITE);
  });

  bus.deferred((done, fail) => {
    const READ = command([
      PN532_COMMAND_INDATAEXCHANGE,
      1,
      MIFARE_CMD_READ,
      block
    ]);

    bus.rx(ack, ack$$1 => {});

    bus.rx(err, fail);

    bus.rx(info, block => {
      console.log("RED", block);

      done();
    });

    Serial1.write(READ);
  });

  bus.deferred(done => {
    setTimeout(() => {
      console.log(process.memory().free);
      done();
      poll();
    }, 1000);
  });
})();
