let runImmediate = [],
  runNextTick = [],
  set = false

const plan = () => {
  if(!set) {
    set = true
    setTimeout(() => {
      const query = [...runNextTick, ...runImmediate]
      runNextTick = []
      runImmediate = []
      query.forEach(f => f())
      set = false
    }, 0)
  }
},
    planOnNextTick = f => {
      runNextTick.push(f)
      plan()
    },
    planImmediate = f => {
      runImmediate.push(f)
      plan()
    }

export { planOnNextTick, planImmediate }
