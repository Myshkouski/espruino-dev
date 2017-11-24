function BufferState(options = {}) {
  Object.assign(this, {
		_buffer: [],
		length: 0
	}, options)
}

BufferState.prototype = {
  push(chunk) {
    const node = {
  		chunk: Buffer.from(chunk),
  		next: null
  	}

    if(this._buffer.length) {
      this._buffer[this._buffer.length - 1].next = node
    }

    this._buffer.push(node)
    this.length += node.chunk.length

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
      if(index < this._buffer[nodeIndex].chunk.length) {
        return {
          index,
          nodeIndex,
          value: this._buffer[nodeIndex].chunk[index]
        }
      }

      index -= this._buffer[nodeIndex].chunk.length
    }
  },

  buffer(length) {
    if(length === undefined) {
      length = this.length
    }

    if(!this.length) {
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

    const offset = this.nodes(to.nodeIndex).reduce((offset, node) => {
      buffer.set(node.chunk, offset)
      return offset + node.chunk.length
    }, 0)

    if(offset < length) {
      const node = this.nodes(1).shift()

      buffer.set(node.chunk.slice(0, length - offset), offset)
      node.chunk = node.chunk.slice(length - offset)

      this.unshift(node)
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
