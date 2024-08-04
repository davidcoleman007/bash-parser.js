const filter = <T>(predicate: (item: T) => boolean) => {
  return (iterable: Iterable<T>) => {
    const result: T[] = [];

    for (const item of iterable) {
      if (predicate(item)) {
        result.push(item);
      }
    }

    return result;
  };
};

export default filter;
