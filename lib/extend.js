function nodeExtend(Super, constructor) {
	function Extended() {
		Super.apply(this, arguments)
		constructor.apply(this, arguments)
	}

	Object.setPrototypeOf(Extended, Super)

	return Extended
}

function espruinoExtend(Super, constructor) {
	function Extended() {
		Super.apply(this, arguments)
		constructor.apply(this, arguments)
	}

	return Extended
}

try {
	function Class() {}
	function Super() {}

	Object.setPrototypeOf(Class, Super)

	module.exports = function extend() { return nodeExtend.apply(this, arguments) }
} catch(err) {
	module.exports = function extend() { return espruinoExtend.apply(this, arguments) }
}