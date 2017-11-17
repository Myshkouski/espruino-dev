function BufferState(options = {}) {
  Object.assign(this, {
		buffer: [],
		length: 0
	}, options)
}

BufferState.prototype = {
  push(chunk) {
    const node = {
  		chunk: Buffer.from(chunk),
  		next: null
  	}

    if(this.buffer.length) {
      this.buffer[this.buffer.length - 1].next = node
    }

    this.buffer.push(node)
    this.length += node.chunk.length
  },

  shift() {
    const node = this.buffer.shift()
    this.length -= node.chunk.length

    return node
  },

  at(index) {
    for(let nodeIndex = 0; nodeIndex < this.buffer.length; nodeIndex ++) {
      if(index < this.buffer[nodeIndex].chunk.length) {
        return {
          index,
          nodeIndex
        }
      }

      index -= this.buffer[nodeIndex].chunk.length
    }
  },

  slice(_from, _to) {
    if(_from > _to) {
      throw new Error('Second argument cannot be less than first')
    }

    let from, to

    if(_from) {
      from = this.at(_from)
    }

    if(!from) {
      from = {
        index: 0,
        nodeIndex: 0
      }
    }

    if(_to) {
      to = this.at(_to)
    }

    if(!to) {
      to = {
        index: this.length - 1,
        nodeIndex: this.buffer.length - 1
      }
    }

    return from.nodeIndex == to.nodeIndex
      ? this.buffer[from.nodeIndex].chunk.slice(from.index, to.index)
      : Buffer.concat([
          this.buffer[from.nodeIndex].chunk.slice(from.index),
          ...this.buffer.slice(1 + from.nodeIndex, to.nodeIndex).map(node => node.chunk),
          this.buffer[to.nodeIndex].chunk.slice(0, to.index)
        ])
  }
}

module.exports = BufferState
