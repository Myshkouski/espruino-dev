export default function extend(Super, Child = function Child() {}, apply) {
	const Proto = function() {}
    Proto.prototype = Super.prototype

	//Child.prototype = new Proto()
	//Child.prototype.constructor = Child

    function Extended() {
    	apply === true && Super.apply(this, arguments)
    	Child.apply(this, arguments)
    }

	Extended.prototype = new Proto()
    Object.defineProperty(Extended.prototype, 'constructor', {
        value: Child
    })

    return Extended
}
