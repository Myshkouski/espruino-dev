export default function extend(...args) {
	const Child = args[0]

	function Extended() {
		for(let Super of Extended.super_)
			Super.apply(this, arguments)

		this.super_ = Extended.super_
  }

	Extended.super_ = args
	Extended.prototype = {}

	for(let Super of args) {
		function Proto() {}
		Proto.prototype = Super.prototype

		const p = new Proto()
		for(let prop in p)
			Extended.prototype[prop] = p[prop]//Object.assign(Extended.prototype, new Proto())
	}

  Object.defineProperty(Extended.prototype, 'constructor', {
      value: Child
  })

  return Extended
}
