export default (name, f) => {
  defProp(f, 'name', { value: name })
  defProp(f, 'toString', { value: () => '[Function' + (f.name !== undefined ? ': ' + f.name : '') + ']' })

  return f
}
