function BufferState(options = {}) {
  Object.assign(this, {
		_buffer: [],
		length: 0
	}, options)
}

BufferState.prototype = {
  push(chunk) {
    if(chunk.length) {
      const node = {
    		chunk: Buffer.from(chunk),
        encoding: 'binary',
    		next: null
    	}

      if(this._buffer.length) {
        this._buffer[this._buffer.length - 1].next = node
      }

      this._buffer.push(node)
      this.length += node.chunk.length
    }

    return this.length
  },

  unshift(chunk) {
    const node = {
  		chunk: Buffer.from(chunk),
      encoding: 'binary',
  		next: null
  	}

    if(this._buffer.length) {
      node.next = this._buffer[0]
    }

    this._buffer.unshift(node)
    this.length += node.chunk.length

    return this.length
  },

  nodes(count) {
    const nodes = this._buffer.splice(0, count)
    nodes.forEach(node => this.length -= node.chunk.length)

    return nodes
  },

  at(index) {
    if(index >= this.length || index < 0) {
      return
    }

    for(let nodeIndex = 0; nodeIndex < this._buffer.length; nodeIndex ++) {
      const chunk = this._buffer[nodeIndex].chunk
      if(index < chunk.length) {
        return {
          index,
          nodeIndex,
          value: chunk[index]
        }
      }

      index -= chunk.length
    }
  },

  for(from, to, callee) {
    const firstNode = this._buffer[from.nodeIndex]
    for(let index = from.nodeIndex; index < firstNode.chunk.length; index ++) {
      callee.call(this, firstNode.chunk[index])
    }

    for(let nodeIndex = 1 + from.nodeIndex; nodeIndex < to.nodeIndex; nodeIndex ++) {
      const node = this._buffer[nodeIndex]
      for(let index = 0; index < node.chunk.length; index ++) {
        callee.call(this, node.chunk[index])
      }
    }

    if(from.nodeIndex < to.nodeIndex) {
      const lastNode = this._buffer[to.nodeIndex]
      for(let index = 0; index <= to.index; index ++) {
        callee.call(this, lastNode.chunk[index])
      }
    }
  },

  slice(length) {
    if(length === undefined) {
      length = this.length
    }

    if(!length) {
      return Buffer.from([])
    }

    if(length > this.length) {
      length = this.length
    }

    let to

    if(length) {
      to = this.at(length)
    }

    if(!to) {
      to = {
        index: this.length - 1,
        nodeIndex: this._buffer.length - 1
      }
    }

    const buffer = Buffer.from([], 0, length)

    const offset = this._buffer.slice(0, to.nodeIndex).reduce((offset, node) => {
      buffer.set(node.chunk, offset)
      return offset + node.chunk.length
    }, 0)

    if(offset < length) {
      const node = this._buffer[to.nodeIndex]

      buffer.set(node.chunk.slice(0, length - offset), offset)
    }

    return buffer
  },

  buffer(length) {
    if(length === undefined) {
      length = this.length
    }

    if(!length) {
      return Buffer.from([])
    }

    if(length > this.length) {
      length = this.length
    }

    let to

    if(length) {
      // console.time('at')
      to = this.at(length)
      // console.timeEnd('at')
    }

    if(!to) {
      to = {
        index: this.length - 1,
        nodeIndex: this._buffer.length - 1
      }
    }
    // console.time('from')
    const buffer = Buffer.from([], 0, length)
    // console.timeEnd('from')
    // console.time('offset')

    // console.timeEnd('buffer')
    const offset = this.nodes(to.nodeIndex).reduce((offset, node) => {
      buffer.set(node.chunk, offset)
      return offset + node.chunk.length
    }, 0)
    // console.timeEnd('offset')
    if(offset < length) {
      const node = this.nodes(1)[0]

      buffer.set(node.chunk.slice(0, length - offset), offset)
      node.chunk = node.chunk.slice(length - offset)

      this.unshift(node.chunk)
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
}

export default BufferState
