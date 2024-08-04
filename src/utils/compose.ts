const compose = (...functions) => (input) => functions.reduceRight((acc, fn) => fn(acc), input);

export default compose;
