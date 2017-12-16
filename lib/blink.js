let status = false
const defaultInterval = 20
const defaultLed = LED2

export const once = ( led, on, cb ) => {
  led.write( 1 )
  setTimeout( () => {
    led.write( 0 )
    cb && cb()
  }, on || defaultInterval )
}

export const start = led => {
  if ( !led ) {
    led = defaultLed
  }
  if ( !status ) {
    status = true

    once( led, defaultInterval, function cb() {
      if ( status ) {
        setTimeout( () => once( led, defaultInterval, cb ), 1000 - defaultInterval )
      }
    } )
  }
}

export const stop = () => {
  if ( status ) {
    status = false
  }
}
