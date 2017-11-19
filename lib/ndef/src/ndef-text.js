/**
  * decode text bytes from ndef record payload
  *
  * @returns a string
  */
export const decode = data => {
    var languageCodeLength = (data[0] & 0x3F), // 6 LSBs
        languageCode = data.slice(1, 1 + languageCodeLength),
        utf16 = (data[0] & 0x80) !== 0 // assuming UTF-16BE

    // TODO need to deal with UTF in the future
    // console.log("lang " + languageCode + (utf16 ? " utf16" : " utf8"))

    return Buffer.from(data.slice(languageCodeLength + 1)).toString()
}

/**
  * Encode text payload
  *
  * @returns an array of bytes
  */
export const encode = (text, lang, encoding) => {
    // ISO/IANA language code, but we're not enforcing
    if (!lang) {
      lang = 'en'
    }

    var encoded = Buffer.from([lang.length, ...[].slice.call(Buffer.from(lang + text))])

    return encoded
}
