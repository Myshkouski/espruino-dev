export default function series( arr, cb, done ) {
  let i = 0
  let aborted = false;
  ( function next( res ) {
    if ( !aborted ) {
      if ( typeof res !== 'undefined' || i >= arr.length ) {
        done && done( res )
      } else {
        setImmediate( () => {
          try {
            cb( next, arr[ i ], i++, arr )
          } catch ( err ) {
            next( err )
            aborted = true
          }
        } )
      }
    }
  } )()
}
