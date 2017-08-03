const on = Object.prototype.on

Object.prototype.on = function() {
	on.apply(this, arguments)

	return this
}

module.exports = Object