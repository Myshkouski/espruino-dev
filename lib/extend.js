function createExtended(Super, constructor, apply) {
	return function Extended() {
		if(apply === true)
			Super.apply(this, arguments)
		constructor.apply(this, arguments)
	}
}

function nodeExtend(Super, constructor, apply) {
	const Extended = createExtended(arguments)

	//Object.setPrototypeOf(Extended, Super)
	Extended.prototype = Object.create(Super)
	Extended.prototype.__proto__ = constructor

	return Extended
}

try {
	function Class() {}
	function Super() {}

	throw new Error()
	nodeExtend(Class, Super)

	module.exports = function extend() { return createExtended.apply(this, arguments) }
} catch(err) {
	module.exports = function extend() { return createExtended.apply(this, arguments) }
}
