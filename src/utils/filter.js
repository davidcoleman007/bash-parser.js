'use strict';

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

module.exports = filter;
