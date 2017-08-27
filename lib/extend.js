export default function extend() {
	const args = []
	for(let Class of arguments)
		args.push(Class)

	const Child = args[0], Proto = args[1]

	const Super = function() {}
  Super.prototype = Proto.prototype

	function Extended() {
		for(let Super of Extended.super_)
			Super.apply(this, arguments)
  }

	Extended.super_ = args

	Extended.prototype = new Proto()
  Object.defineProperty(Extended.prototype, 'constructor', {
      value: Child
  })

  return Extended
}
