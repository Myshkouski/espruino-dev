const defProp = (obj, prop, desc) => {
  try {
    Object.defineProperty(obj, prop, desc)
    return obj
  } catch(e) {
    if(desc.get)
      obj.value = desc.get()
    else if(desc.value)
      obj[prop] = desc.value

    return obj
  }
}

export {
  defProp
}
