
const compose = (...functions) => input =>
  functions.reduceRight((acc, fn) => fn(acc), input);

module.exports = compose;