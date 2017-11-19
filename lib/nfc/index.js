import {
  PN532_PREAMBLE,
  PN532_STARTCODE1,
  PN532_STARTCODE2,
  PN532_HOSTTOPN532,
  PN532_POSTAMBLE
} from './constants'

export const cmd = command => {
  let i, arr = [
    PN532_PREAMBLE,
    PN532_STARTCODE1,
    PN532_STARTCODE2,
    command.length + 1,
    (~command.length) & 0xff,
    PN532_HOSTTOPN532
  ].concat(command)

  let checksum = -arr[0]
  for (i in arr)
    checksum+=arr[i]
  arr.push((~checksum) & 0xFF)
  checksum=0
  for (i in arr)
    checksum+=arr[i]
  arr.push(PN532_POSTAMBLE)
  return new Uint8ClampedArray(arr)
}
