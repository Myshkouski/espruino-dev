// var frame1 = [0, 1, 2, 3, 4],
// 	frame2 = [5, 6, 7, 8, 9],
// 	data = [].concat(frame1).concat(frame2),
// 	preamble = [0, 1, 2, 3],
// 	header = [4, (byte, index, frame) => 5, 6],
// 	trailer = new Array(2),
// 	postamble = () => 9
//
// var expected = [
// 	preamble,
// 	header,
// 	trailer,
// 	postamble
// ]

function _pushTo(target, source) {
	source = source || []

	for (let index = 0; index < source.length; index++) {
		target.push(source[index])
	}

	return target
}

function _resolve(byte, expected) {
	if (expected[0].length > expected[1]) {
		let expectedByte = expected[0][expected[1]]

		if (expectedByte instanceof Function) {
			var consumedChunk = expected[0].slice(0, expected[1])
			expectedByte = expectedByte.call(undefined, byte, expected[1], expected[0])

			if (Array.isArray(expectedByte)) {
				var header = expected[0].slice(0, expected[1])
				var trailer = expected[0].slice(1 + expected[1], expected[0].length)

				expected[0] = _pushTo(header, expectedByte).concat(trailer)
				expectedByte = expectedByte[0]
			}
		}

		if (!expectedByte || expectedByte === byte) {
			expected[0][expected[1]] = byte

			expected[1]++

			return true
		}
	}

	return false
}

function _toConsumablePattern(frame) {
	const consumablePattern = []

	for (let index in frame) {
		let pattern = frame[index]

		if (Array.isArray(pattern)) {
			_pushTo(consumablePattern, pattern)
		} else {
			consumablePattern.push(pattern)
		}
	}

	for (let index in consumablePattern) {
		const value = consumablePattern[index]
		if (!(!isNaN(value) || value instanceof Function || value === undefined)) {
			throw new TypeError('Cannot create pattern with "' + typeof value + '" type')
		}
	}

	return consumablePattern
}

function _consumeChunk(buffer) {
	for (let _expectedIndex = 0; _expectedIndex < _expected.length; _expectedIndex++) {
		var expected = _expected[_expectedIndex]

		for (var index in buffer) {
			var resolved = _resolve(buffer[index], expected)

			if (!resolved) {
				console.log('not match at', expected[1], expected[0])
				expected.splice(_expectedIndex, 1)

				break
			}

			if (expected[0].length === expected[1]) {
				console.log('found', expected[0])
				_expected.splice(0, _expected.length)
				break
			}
		}
	}
}
