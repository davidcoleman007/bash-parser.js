const fromArray = async function* <T>(array: T[]): AsyncIterableIterator<T> {
  for (const item of array) {
    yield item;
  }
};

export default fromArray;
