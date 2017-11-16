export default function series(arr, cb, done) {
  let i = 0
  ;(function next(res) {
    if (res !== undefined || i >= arr.length) {
      done && done(res)
    }
    else {
      setImmediate(() => cb(next, arr[i], i++, arr))
    }
  })()
}
