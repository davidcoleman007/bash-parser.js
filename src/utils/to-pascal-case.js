const hasSpace = /\s/
const hasSeparator = /(_|-|\.|:)/
const hasCamel = /([a-z][A-Z]|[A-Z][a-z])/

const separatorSplitter = /[\W_]+(.|$)/g
const camelSplitter = /(.)([A-Z]+)/g

const toNoCase = string => {
  if (hasSpace.test(string)) return string.toLowerCase()
  if (hasSeparator.test(string)) return (unseparate(string) || string).toLowerCase()
  if (hasCamel.test(string)) return uncamelize(string).toLowerCase()
  return string.toLowerCase()
}

const unseparate = string => {
  return string.replace(separatorSplitter, (m, next) => {
    return next ? ' ' + next : ''
  })
}

const uncamelize = string => {
  return string.replace(camelSplitter, (m, previous, uppers) => {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ')
  })
}

const toSpaceCase = string => {
  return toNoCase(string).replace(/[\W_]+(.|$)/g, (matches, match) => {
    return match ? ' ' + match : ''
  }).trim()
}

const toPascalCase = string => {
  return toSpaceCase(string).replace(/(?:^|\s)(\w)/g, (matches, letter) => {
    return letter.toUpperCase()
  })
}

export default toPascalCase;
