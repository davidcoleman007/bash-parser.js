type FilterFn<T> = (item: T) => boolean;

const filter = <T>(predicate: FilterFn<T>) => {
  return async function* (iter: AsyncIterable<T>): AsyncIterable<T> {
    for await (const item of iter) {
      if (predicate(item)) {
        yield item;
      }
    }
  };
};

export default filter;
