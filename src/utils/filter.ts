

function filter(predicate) {
  return function(iterable) {
    const result = [];

    for (const item of iterable) {
      if (predicate(item)) {
        result.push(item);
      }
    }

    return result;
  };
}

export default filter;
